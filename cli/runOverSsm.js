const { exec, spawn } = require('child_process');

const DEBUG = false

let previouslyCheckedRemoteCommand = ''

async function startRemoteCommand(region, profile, instanceId, comment, remoteCommand) {
  if (DEBUG) console.log(`startRemoteCommand(${instanceId}, ${comment})`);

  const localCommand = `aws ssm send-command`
  + ` --region ${region}`
  + ` --instance-ids "${instanceId}"`
  + ` --document-name "AWS-RunShellScript"`
  + ` --comment "${comment}" `
  + ` --parameters commands="${remoteCommand}"`
  + ` --output json`

  console.error(``);
  console.error(`     ` + `AWS_PROFILE=${profile} ${localCommand}`.dim);
  previouslyCheckedRemoteCommand = ''

  return new Promise((resolve, reject) => {
    let stdout = ''
    const child = spawn(localCommand, {
      // stdio: 'inherit',
      shell: true,
      env: { AWS_PROFILE: profile, PATH: '/usr/local/bin:/bin:/usr/bin' },
    });
    child.stdout.on('data', (data) => {
      // console.log(`stdout: ${data}`);
      stdout += data
    });
    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    child.on('close', (code) => {
      // console.log(`Session exited with code ${code}. Goodbye.`);

      if (code === 0) {
        // console.log(`OUTPUT IS:\n`, stdout);

        try {
          let obj = JSON.parse(stdout)
// console.log(`reply to starting is`, JSON.stringify(obj, '', 2));
          const remoteCommandId = obj.Command.CommandId
          const remoteStatus = obj.Command.Status
          // console.log(`remoteCommandId=${remoteCommandId}`);
          console.log(`     ` + `commandId=${remoteCommandId}`.dim);
          resolve({ remoteCommandId, remoteStatus, raw: stdout })
        } catch (e) {
          console.log(`startRemoteCommand: Error parsing output:`, e);
          reject(e)
        }
      } else {
        reject(new Error(`Local exit status ${code}`))
      }
    });
  })
}//- startCommand

async function checkRemoteCommand(region, profile, commandId) {
  if (DEBUG) console.log(`checkRemoteCommand(${commandId})`);

  const command = `aws ssm list-command-invocations --region ${region} --command-id ${commandId} --details`
  if (previouslyCheckedRemoteCommand !== command) {
    console.log(`     ` + command.dim);
    console.log(``);
    previouslyCheckedRemoteCommand = command
  }
  return new Promise((resolve, reject) => {
    let stdout = ''
    const child = spawn(command, {
      // stdio: 'inherit',
      shell: true,
      env: { AWS_PROFILE: profile, PATH: '/usr/local/bin:/bin:/usr/bin' },
    });
    child.stdout.on('data', (data) => {
      // console.log(`stdout: ${data}`);
      stdout += data
    });
    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    child.on('close', (code) => {
      // console.log(`Local command exited with code ${code}.`);

      if (code === 0) {
        // console.log(`STDOUT IS:\n`, stdout);

        try {
          let obj = JSON.parse(stdout)
          const remoteStatus = obj.CommandInvocations[0].Status
          const output = obj.CommandInvocations[0].CommandPlugins[0].Output
          resolve({ localStatus: code, remoteStatus, output, raw: stdout })
        } catch (e) {
          console.log(`checkRemoteCommand(${commandId}): Error parsing output:`, e);
          // resolve({ localStatus: code, remoteStatus: 'Unknown', output: '', raw: stdout })
          reject(e)
        }
      } else {
        // resolve({ localStatus: code, remoteStatus: 'Unknown', output: '', raw: stdout })
        reject(new Error(`Exit status ${code}`))
        // resolve({ commandId, status: 'Error', output: '', code, raw: `Exit status: ${code}`})
      }
    });
  })
}//- startCommand

async function waitForRemoteCommand(region, profile, remoteCommandId) {
  if (DEBUG) console.log(`waitForRemoteCommand()`);

  let result = await checkRemoteCommand(region, profile, remoteCommandId)
  // console.log(`remoteStatus=${result.remoteStatus}`);
  if (result.remoteStatus != 'InProgress') {
    return result
  }
  // if (result.remoteStatus == 'Success') {
  //   return result
  // } else if (result.remoteStatus = 'Failed') {
  //   setTimeout(()=>{// time for stderr to be shown
  //     throw new Error(`Remote command failed`)
  //   }, 500)
  // } else if (result.remoteStatus != 'InProgress') {
  //   console.log(`Don't know how to interpret result:\n`, result);
  //   setTimeout(()=>{// time for stderr to be shown
  //     throw new Error(`Unknown status`)
  //   }, 500)
  // }

  // Wait and try again
  if (DEBUG) console.log(`waiting...`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      waitForRemoteCommand(region, profile, remoteCommandId).then(resolve).catch(reject)
    }, 500)
  })
}//- waitForRemoteCommand

module.exports = {
  startRemoteCommand,
  checkRemoteCommand,
  waitForRemoteCommand,
}
