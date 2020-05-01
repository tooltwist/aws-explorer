const AWS = require('aws-sdk')
const program = require('commander');
const myAWS = require('../server/misc/myAWS')
const graph = require('../server/misc/graph')
const capitalize = require('../server/misc/util').capitalize
const pad = require('../server/misc/util').pad
const download = require('../server/misc/download')
const types = require('../lib/types')
const inquirer = require('inquirer');
const consola = require('consola')
const propertiesReader = require('properties-reader');
const { exec, spawn } = require('child_process');

const CliMysql = require('./CliMysql')

const debug = false

async function CliRemotePrompted_2020_04_01(options) {

  // Load the profiles
  const homedir = require('os').homedir()
  const awsCredentialsFile = propertiesReader(`${homedir}/.aws/credentials`);
  const profileHash = { }
  awsCredentialsFile.each(propertyPath => {
    // console.log(`-> ${propertyPath}`);
    let pos = propertyPath.indexOf('.')
    if (pos > 0) {
      let section = propertyPath.substring(0, pos)
      profileHash[section] = true
    }
  })
  // const profileList = Object.keys(profileHash).sort()

  let chosenProfile
  if (options.profile) {
    // Check the profile is valid
    //ZZZZ
    chosenProfile = options.profile
    // console.log(`Profile specified on command line: ${chosenProfile}`);
    var credentials = new AWS.SharedIniFileCredentials({profile: chosenProfile});
    AWS.config.credentials = credentials;
  } else {
    // Prompt for the profile
    let defaultProfile = ''
    // if (process.env['AE_PROFILE']) {
    //   console.log(`Use environment variable AE_PROFILE as default profile`);
    //   defaultProfile = process.env['AE_PROFILE']
    // } else
    if (process.env['AWS_PROFILE']) {
      console.log(`Use environment variable AWS_PROFILE as default profile`);
      defaultProfile = process.env['AWS_PROFILE']
    }

    // Ask now
    const profileQuestion = [
      {
        type: 'list',
        name: 'profile',
        message: `AWS profile?`,
        choices: Object.keys(profileHash).sort(),
        default: defaultProfile,
        // filter: function (val) {
        //   return val.toLowerCase();
        // }
      },
    ];
    // profileQuestion[0].choices.push('default')
    const selection = await inquirer.prompt(profileQuestion)
    chosenProfile = selection.profile
    // console.log(`chosenProfile is ${chosenProfile}\n`);

    var credentials = new AWS.SharedIniFileCredentials({profile: chosenProfile});
    AWS.config.credentials = credentials;
  }

  // We need to choose a region so we can initialize, before we can select a list of regions. :-)
  myAWS.checkAwsRegion('ap-southeast-1');
  let regions = await myAWS.downloadRegions()


  // Choose a region
  let chosenRegion
  if (options.region) {
    // Check the region is valid
    //ZZZZ
    // console.log(`Region specified on command line: ${options.region}`);
    chosenRegion = options.region
  } else {
    // Prompt for the region
    let defaultRegion = ''
    let defaultRegionDesc = ''
    if (process.env['AE_REGION']) {
      console.log(`Use environment variable AE_REGION as default profile`);
      defaultRegion = process.env['AE_REGION']
      defaultRegionDesc = ` [${defaultRegion}]`
    }
    const regionQuestion = [
      {
        type: 'list',
        name: 'region',
        message: `AWS region [${defaultRegionDesc}]?`,
        choices: [ ],
        default: defaultRegion,
        filter: function (val) {
          return val.toLowerCase();
        }
      },
    ];
    regions.forEach(region => {
      const description = myAWS.regionDescription(region.RegionName)
      regionQuestion[0].choices.push({
        name: `${description} (${region.RegionName})`,
        value: region.RegionName
      })
    })
    regionQuestion[0].choices.sort()
    const result = await inquirer.prompt(regionQuestion)
    chosenRegion = result.region
    // console.log(`chosenRegion is ${chosenRegion}\n`);
  }//- if
  const region = myAWS.checkAwsRegion(chosenRegion);
  const regionName = capitalize(myAWS.regionDescription(region))


  

  // myConfig = new AWS.Config();
  // AWS.config.update({
  //   region: 'us-east-1'
  // });

  
  // let region = program.region || myAWS.INITIAL_REGION;
  // console.log();
  // console.log();
  // console.log();
  // console.log(`**********************************************************`);
  // console.log(`***                                                    ***`);
  // console.log(`***   NOTE: Region is ${region} ${pad('('+regionName+')', 15)}   ***`);
  // console.log(`***                                                    ***`);
  // console.log(`**********************************************************`);
  // console.log();
  // if (!myAWS.INITIAL_REGION) {
  //   console.log(`Tip: You can specify region with the -r <region> option.`);
  // }
  // console.log();
  // console.log();

  // consola.ready({
  //   message: `NOTE: Region is ${region} (${regionName})`,
  //   badge: true
  // })

  // console.log(`Regions=`, regions);



  // Ask which environment

  // Get a list of environments
  console.error(`Gathering information...`);
  graph.reset();
  await download.downloadInstances()
  await download.downloadClusters()
  await download.downloadDatabases()
  await download.downloadSecurityGroups()
  console.error(`done.\n`);

  let clist = graph.nodes().filter(node => (node.type === types.CLUSTER))
  let list = graph.nodes().filter(node => (node.type === types.INSTANCE))
  let dlist = graph.nodes().filter(node => (node.type === types.DATABASE))
  // console.log(`clusters=`, clist); 
  // console.log(`instances=`, list); 
  // console.log(`databases=`, dlist); 

  const environmentsAndClusters = { }
  const addEandC = (label, instance) => {
    let entry = environmentsAndClusters[label]
    if (!entry) {
      entry = { label, instanceIds: { } }
      environmentsAndClusters[label] = entry
    }
    let name
    let description
    // let environment
// console.log(`tags:`, instance.data.Tags);
    instance.data.Tags.forEach(tag => {
      if (tag.Key == 'Name') { name = tag.Value };
      if (tag.Key == 'Description') { description = tag.Value };
      // if (tag.Key == 'Environment') { environment = tag.Value };
    })
    const isJumpbox = (instance.data._isJumpbox) ? 1 : 0;
    // let desc2 = instance.id
    // if (description) {
    //   desc2 = description
    // }
    // if (name) {
    //   desc2 = name
    // }
    entry.instanceIds[instance.id] = { name, description, isJumpbox}
  };// addEandC

  // Add clusters
  clist.forEach(cluster => {
    const instancePrefix = 'EC2 Instance::'
    cluster.children.forEach(childId => {
      // console.log(`   -> ${childId}`);
      if (childId.startsWith(instancePrefix)) {
        // console.log(`   MATCH`);
        const instanceId = childId.substring(instancePrefix.length)
        const instance = download.findInstanceById(instanceId)
        addEandC(`Cluster ${cluster.id}`, instance)
      }
    })
  })

  // Add instances, and the environment they are in
  list.forEach(instance => {
    // const instanceId = instance.id
    let name
    let description
    let environment
// console.log(`tags:`, instance.data.Tags);
    instance.data.Tags.forEach(tag => {
      if (tag.Key == 'Name') { name = tag.Value };
      if (tag.Key == 'Description') { description = tag.Value };
      if (tag.Key == 'Environment') { environment = tag.Value };
    })
    const isJumpbox = (instance.data._isJumpbox) ? 1 : 0;
    if (environment) {
      addEandC(`Environment ${environment}`, instance)
    }
    let id = instance.id
    if (description) {
      id = description
    }
    if (name) {
      id = name
    }
    if (instance.data._isJumpbox) {
      addEandC(`Jumpbox ${id}`, instance)
    } else {
      addEandC(`Instance ${id}`, instance)
    }
  })
  // console.log(`EandC=`, JSON.stringify(environmentsAndClusters, '', 2));

  // Add databases, and the instances that can get through to them
  dlist.forEach(db => {
    // console.log(`db is `, db);

    // Instances can not be in a database security group, so
    // 1. Find the database security group for the database.
    // 2. Find the application security groups that can access that database security group.
    // 3. Find instances in those application security groups.
    db.parents.forEach(parent => {
      if (parent.startsWith(`${types.SECGRP}::`)) {
        // console.log(`\n\n----- DB secgrp is ${parent}`);
        const dbSecGrp = graph.nodeWithKey(parent)
        // console.log(`db grp=>\n`, dbSecGrp);
        dbSecGrp.parents.forEach(parent2 => {
          if (parent2.startsWith(`${types.SECGRP}::`)) {
            // console.log(`\n\n----- App secgrp is ${parent2}`);
            const appSecGrp = graph.nodeWithKey(parent2)
            // console.log(`app grp=>\n`, appSecGrp);
            appSecGrp.children.forEach(child => {
              if (child.startsWith(`${types.INSTANCE}::`)) {
                // console.log(`INSTANCE IS ${child}`);
                const instance = graph.nodeWithKey(child)
                addEandC(`Database ${db.id}`, instance)
              }
            })
          }
        })
      }
    })
  })

  // const ecList = Object.entries(environmentsAndClusters)
  // console.log(`ecList=`, ecList);


  // Ask which environment, cluster, instance, etc
  const ecQuestion = [
    {
      type: 'list',
      name: 'environment',
      message: 'What would you like to connect to?',
      choices: [ ],
    },
  ];
  for (let label in environmentsAndClusters) {
    const value = environmentsAndClusters[label]
    ecQuestion[0].choices.push({ name: label, value: value })
  }
  ecQuestion[0].choices.sort((l1, l2) => {
    if (l1.name > l2.name) return +1
    if (l1.name < l2.name) return -1
    return 0
  })
  const ecResult = await inquirer.prompt(ecQuestion)
  // console.log(`ecResult=`, ecResult);


  // Ask which instance
  let numInstances = 0
  let firstInstanceId = null
  for (let instanceId in ecResult.environment.instanceIds) {
    numInstances++
    if (firstInstanceId === null) {
      firstInstanceId = instanceId
    }
  }

  let instanceId
  console.log(`${numInstances} instances`);
  if (numInstances == 1) {
    // Select the only instance available.
    instanceId = firstInstanceId
  } else {
    // Select one of the instances
    const instanceQuestion = [
      {
        type: 'list',
        name: 'instanceId',
        message: 'Instance?',
        choices: [ ],
      },
    ];
    for (let instanceId in ecResult.environment.instanceIds) {
      const record = ecResult.environment.instanceIds[instanceId]
      let label = instanceId
      if (record.description) {
        label = record.description
      }
      if (record.name) {
        label = record.name
      }
      instanceQuestion[0].choices.push({ name: label, value: instanceId })
    }
    const instanceResult = await inquirer.prompt(instanceQuestion)
    // console.log(`instanceResult=`, instanceResult);
    instanceId = instanceResult.instanceId
  }
  const instance = download.findInstanceById(instanceId)
  // console.log(`SELECTED INSTANCE=\n`, instance);

  const keyName = instance.data.KeyName
  const state = instance.data.State.Name
  const publicDns = instance.data.PublinDnsName
  const publicIpAddress = instance.data.PublicIpAddress
  // const state = instance.data.Monitoring.State
  // const state = instance.data.Monitoring.State
  // console.log(`keyName=${keyName}, state=${state}, publicDns=${publicDns}, publicIpAddress=${publicIpAddress}`);
  

  // Ask what to do with the instance

  // Ask which environment
  const opQuestion = [
    {
      type: 'list',
      name: 'operation',
      message: 'operation?',
      // choices: Object.keys(environmentsAndClusters).sort(),
      choices: [ ],
    },
  ];
  if (keyName && publicIpAddress) {
    opQuestion[0].choices.push({ name: 'Login with SSH', value: 'ssh'})
  }
  opQuestion[0].choices.push({ name: 'Login with SSM', value: 'ssm'})
  opQuestion[0].choices.push({ name: 'docker ps', value: 'docker-ps'})
  
  const opResult = await inquirer.prompt(opQuestion)
  // console.log(`opResult=`, opResult);
  const operation = opResult.operation

  // Now run the selected operation
  if (operation === 'ssm') {
    console.error(``);
    console.error(`Using the following command...`);
    console.error(``);
    console.error(`     AWS_PROFILE=${chosenProfile} aws ssm start-session --target ${instanceId}`)
    console.error(``);
    const child = spawn(`aws ssm start-session --target ${instanceId}`, {
      stdio: 'inherit',
      shell: true,
      env: { AWS_PROFILE: chosenProfile, PATH: '/usr/local/bin:/bin:/usr/bin' },
    });
    child.on('close', (code) => {
      console.log(`Session exited with code ${code}. Goodbye.`);
    });
  } else if (operation === 'ssh') {
    /*
     *  Login using SSH
     */
    const cmd = `ssh -i ~/.ssh/${keyName}.pem ec2-user@${publicIpAddress}`
    console.error(``);
    console.error(`Using the following command...`);
    console.error(``);
    console.error(`     ${cmd}`)
    console.error(``);
    const child = spawn(cmd, {
      stdio: 'inherit',
      shell: true,
      env: { AWS_PROFILE: chosenProfile, PATH: '/usr/local/bin:/bin:/usr/bin' },
    });
    child.on('close', (code) => {
      console.log(`Session exited with code ${code}. Goodbye.`);
    });
  } else if (operation === 'docker-ps') {
    console.log(``);
    // console.log(`The run  command...`);
    // console.log(``);
    // console.log(`     AWS_PROFILE=${chosenProfile} aws ssm start-session --target ${instanceId}`)
    // console.log(`     $ sudo /bin/bash`);
    // console.log(``);

    // Start the command
    const remoteCommand = `sudo docker ps`
    const comment = remoteCommand

    try {
      let startReply = await startRemoteCommand(chosenProfile, instanceId, comment, remoteCommand)
      // console.log(`startReply=`, startReply);
      if (startReply.remoteStatus !== 'Pending') {
        console.error(`Failed to start remote command`);
        console.error(`Status: ${startReply.remoteStatus}`)
        process.exit(1)
      }
      // console.log(`Started okay`);      
      let remoteCommandId = startReply.remoteCommandId
      let endReply = await waitForRemoteCommand(chosenProfile, remoteCommandId)
      // console.log(`endReply=`, endReply);
      if (endReply.remoteStatus !== 'Success') {
        console.error(`Failed to run remote command`);
        console.error(`Status: ${endReply.remoteStatus}`)
        if (endReply.output) {
          console.error(`Error message:\n${endReply.output}`)
        }
        process.exit(1)
      }
      console.log(endReply.output);
      process.exit(0)
    } catch (e) {
      console.error(e);
      process.exit(1)
    }
  }
  
  

return


  // download.downloadInstances(err => {
  //   if (err) {
  //     console.log('Error: ', err)
  //   }
  //   download.downloadDatabases(err => {
  //     if (err) {
  //       console.log('Error: ', err)
  //     }

      // Collect just the EC2 Instances
      // console.log(`instances=`, list);




      // Patch on the name and other values
      let environments = { } // name -> { instanceNodes[] }
      list.forEach(node => {
        // console.log(`-------- instance is ${node.id}  (${node.data.KeyName})`);
        // console.log(`tags=`, node.data.Tags);
        node._name = ''
        node._description = ''
        node._environment = ''
        node.data.Tags.forEach(tag => {
          if (tag.Key == 'Name') { node._name = tag.Value };
          if (tag.Key == 'Description') { node._description = tag.Value };
          if (tag.Key == 'Environment') { node._environment = tag.Value };
        })
        node._isJumpbox = (node.data._isJumpbox) ? 1 : 0;

        let env = environments[node._environment]
        if (env) {
          env.instanceNodes.push(node)
        } else {
          environments[node._environment] = {
            instanceNodes: [ node ]
          }
        }
      });


      // Ask which environment
      var envQuestion = [
        {
          type: 'list',
          name: 'environment',
          message: 'Environment?',
          choices: [
          ],
          filter: function (val) {
            return val.toLowerCase();
          }
        },
      ];
      Object.keys(environments).forEach(function(key,index) {
        if (key) {
          envQuestion[0].choices.push(key)
        }
      })
      envQuestion[0].choices.sort()
      inquirer.prompt(envQuestion).then((answers) => {

        // We have the environment.
        // Now let's create questions and options for that environment
        let environmentName = answers.environment
        let env = environments[environmentName]
        var questions = [ ]

        // Add a question for the jumpbox
        let jumpboxes = [ ] // label -> node
        let jbQuestion = {
          type: 'list',
          name: 'jumpboxLabel',
          message: 'Jumpbox?',
          choices: [ ],
          filter: function (val) {
            return val.toLowerCase();
          }
        };
        env.instanceNodes.forEach((node) => {
          if (node._isJumpbox) {
            let label = `${node._name} (${node.data.State.Name})`
            jumpboxes[label] = node
            jbQuestion.choices.push(label)
          }
        })
        questions.push(jbQuestion)

        // Add a question for the ECS Host
        let ecsHosts = [ ] // label -> node
        let hostQuestion = {
          type: 'list',
          name: 'ecsHostLabel',
          message: 'ECS Host?',
          choices: [ ]
        };
        env.instanceNodes.forEach((node) => {
          if (!node._isJumpbox) {
            let label = `${node._name} (${node.data.State.Name})`
            ecsHosts[label] = node
            hostQuestion.choices.push(label)
          }
        })
        questions.push(hostQuestion)

        // Add a question for the DB host
        let dbHosts = [ ] // label -> node
        let dbQuestion = {
          type: 'list',
          name: 'dbHostLabel',
          message: 'Database Host?',
          choices: [ ]
        };
        graph.nodes().filter(node => (node.type === types.DATABASE)).forEach((node) => {
          // console.log(`db=`, node);
          let label = `${node.data.DBInstanceIdentifier}`
          if (node.data.Endpoint) {
            label += ` (${node.data.Endpoint.Address})`
          }
          dbHosts[label] = node
          dbQuestion.choices.push(label)
        })
        questions.push(dbQuestion)

        // Add questions for the DB connection
        questions.push({
          type: 'input',
          name: 'dbname',
          message: 'Database name?'
        })
        questions.push({
          type: 'input',
          name: 'username',
          message: 'Username?'
        })
        questions.push({
          type: 'password',
          name: 'password',
          message: 'Password?'
        })

        inquirer.prompt(questions).then((answers) => {
          // console.log('\nReplies:');
          // console.log(JSON.stringify(answers, null, '  '));
          console.log(`answers=`, answers);

          let jumpboxNode = jumpboxes[answers.jumpboxLabel]
          // console.log(`jumpbox is `, jumpboxNode);
          let jumpboxIp = jumpboxNode.data.PublicIpAddress
          // console.log(`jumpboxIp=${jumpboxIp}`);

          let ecsHostNode = ecsHosts[answers.ecsHostLabel]
          // console.log(`jumpbox is `, jumpboxNode);
          let ecsHostIp = ecsHostNode.data.PrivateIpAddress
          // console.log(`ecsHostIp=${ecsHostIp}`);

          let dbHostNode = dbHosts[answers.dbHostLabel]
          // console.log(`db is `, dbHostNode);
          let dbHost = dbHostNode.data.Endpoint.Address
          // console.log(`dbHost=${dbHost}`);

          // Now show the commands
          CliMysql(environmentName, jumpboxIp, ecsHostIp, dbHost, answers.dbname, answers.username, answers.password)
        });
      });
  //   })
  // })
}


async function startRemoteCommand(profile, instanceId, comment, remoteCommand) {
  if (debug) console.log(`startRemoteCommand(${instanceId}, ${comment})`);

  const localCommand = `aws ssm send-command`
  + ` --instance-ids "${instanceId}"`
  + ` --document-name "AWS-RunShellScript"`
  + ` --comment "${comment}" `
  + ` --parameters commands="${remoteCommand}"`
  + ` --output json`

  console.error(``);
  console.error(`Using the following command...`);
  console.error(``);
  console.error(`     AWS_PROFILE=${profile} ${localCommand}`);
  console.error(``);


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
  if (debug) console.log(`checkRemoteCommand(${commandId})`);

  const command = `aws ssm list-command-invocations --command-id ${commandId} --details`
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
  if (debug) console.log(`waitForRemoteCommand()`);

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
  if (debug) console.log(`waiting...`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      waitForRemoteCommand(profile, remoteCommandId).then(resolve).catch(reject)
    }, 500)
  })
}//- waitForRemoteCommand





async function parseCommandLine(callback/*(unknownCommand, useDefault)*/) {

  // console.log(`YYYYY YAAAARRRRRPPPPP  CLIremote()`);

  /*
   *  Main thread starts here.
   */
  let haveCommand = false
  program
    .version('0.2.0')
    .option('-e, --environment <env>', 'Environment')
    .option(`-p, --profile <profile>`, 'Profile')
    .option(`-r, --region <region>`, 'Region')

  // Access database via a jump box
  program
    .command('remote')
    .description('Connect to AWS instances')
    .action(function() {
      // console.log(`program.opts()`, program.opts());
      haveCommand = true
      CliRemotePrompted_2020_04_01(program.opts())
        .then(result => {

        }).catch(e => {
          console.log(e);
        })
    });

  // Parse the arguments
  program.parse(process.argv);

  // console.log(`haveCommand=${haveCommand}`)
  
  // if (!haveCommand) {
  //   return ({unknownCommand:true, useDefault:false})
  // }
}

module.exports.parseCommandLine = parseCommandLine
// module.exports. = CliRemotePrompted_2020_04_01
