const { exec, spawn } = require('child_process');

const DEBUG = true

let previouslyCheckedRemoteCommand = ''

async function startRemoteCommand(profile, instanceId, comment, remoteCommand) {
  if (DEBUG) console.log(`startRemoteCommand(${instanceId}, ${comment})`);

  const localCommand = `aws ssm send-command`
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

async function checkRemoteCommand(profile, commandId) {
  if (DEBUG) console.log(`checkRemoteCommand(${commandId})`);

  const command = `aws ssm list-command-invocations --command-id ${commandId} --details`
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

async function waitForRemoteCommand(profile, remoteCommandId) {
  if (DEBUG) console.log(`waitForRemoteCommand()`);

  let result = await checkRemoteCommand(profile, remoteCommandId)
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
      waitForRemoteCommand(profile, remoteCommandId).then(resolve).catch(reject)
    }, 500)
  })
}//- waitForRemoteCommand

module.exports = {
  startRemoteCommand,
  checkRemoteCommand,
  waitForRemoteCommand,
}


/*



AWS_PROFILE=personal aws ssm start-session --region ap-southeast-1 --target i-0d2a68a0c39be61c5 --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["33306"],"localPortNumber":["33306"]}'
AWS_PROFILE=personal aws ssm start-session --region ap-southeast-1 --target i-0d2a68a0c39be61c5 --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["22"],"localPortNumber":["33322"]}'
ssh -p 33322 ec2-user@127.0.0.1
ssh -p 33322 ec2-user@127.0.0.1 docker run -it --rm mysql mysql -h ${dbhost}  -u ${username} -p${password} ${dbname}
ssh -p 33322 ec2-user@127.0.0.1 docker run -it --rm mysql mysql -h test-juiceconfig.cyazdhriukql.ap-southeast-1.rds.amazonaws.com  -u admin -p$M0use123 adl-api

test-juiceconfig.cyazdhriukql.ap-southeast-1.rds.amazonaws.com


  let tunnelCmd = `ssh -nNT -i ${keyfile} -L ${localPort}:${ip2}:22 ec2-user@${ip1} -L ${httpPort}:${ip2}:${phpmyadminPort} ec2-user@${ip1}      `
  let loginCmd = `ssh -t -i ${keyfile} -p ${localPort} ec2-user@127.0.0.1       `
  let mysqlCmd = `ssh -t -i ${keyfile} -p ${localPort} ec2-user@127.0.0.1 docker run -it --rm mysql mysql -h ${dbhost}  -u ${username} -p${password} ${dbname}       `
  let phpmyadminCmd = `ssh -t -i ${keyfile} -p ${localPort} ec2-user@127.0.0.1 docker run -it --rm -p ${phpmyadminPort}:80 -e PMA_HOST=${dbhost} phpmyadmin/phpmyadmin:4.6.4-1        `


  Once 22 is established:

  ssh -t -i ${keyfile} -p ${localPort} ec2-user@127.0.0.1

  ssh -t -i ~/.ssh/j-test-ap-southeast-1.pem -p 33322 -L 59595:127.0.0.1:59595 ec2-user@127.0.0.1 docker run -it --rm -p 59595:80 -e PMA_HOST=test-juiceconfig.cyazdhriukql.ap-southeast-1.rds.amazonaws.com phpmyadmin/phpmyadmin:4.6.4-1

  ssh -t -i ~/.ssh/j-test-ap-southeast-1.pem -p 33322 -L 59595:127.0.0.1:59595 ec2-user@127.0.0.1 docker run  -it --rm mysql mysql -h test-juiceconfig.cyazdhriukql.ap-southeast-1.rds.amazonaws.com  --ssl-mode=DISABLED -u admin -pM0use123 adlforms

  Tunnelling:
  https://aws.amazon.com/blogs/aws/new-port-forwarding-using-aws-system-manager-sessions-manager/

*/