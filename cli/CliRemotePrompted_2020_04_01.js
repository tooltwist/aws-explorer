const USE_TEMPORARY_KEYFILE = false
const LOG_DURATION_ENTIRE_LOG = -1
const LOG_DURATION_TAIL = 0


async function closeTunnel(options, sessionId) {
  // console.log(`closeTunnel()`);
  return new Promise((resolve, reject) => {

    // Remove the temporary keypair
    const keypairFile = temporaryKeypairFile()
    console.error(`     ` + `rm ${keypairFile} ${keypairFile}.pub`.dim);
    try {
      fs.unlinkSync(`${keypairFile}`)
      fs.unlinkSync(`${keypairFile}.pub`)
    } catch (e) {
      // ignore the error
    }

    var params = {
      SessionId: sessionId
    };
    myAWS.ssm().terminateSession(params, function (err, data) {
      if (err) {
        console.log(`terminateSession error:`);
        console.log(err, err.stack); // an error occurred
        reject(err)
      }
      else {
        // console.log(data);           // successful response
        // Give the tunnel time to write it's exit status.
        setTimeout(() => {
          resolve(null)
        }, 500)
      }
    });
  })//- promise
}//- closeTunnel
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
const { execSync, spawn } = require('child_process');
const colors = require('colors')
const CliMysql = require('./CliMysql')
// const phpmyadminOperation = require('./phpmyadminOperation')
const runOverSsm = require('./runOverSsm')
const portfinder = require('portfinder');
const fs = require('fs');
const moment = require('moment');

const debug = false


const connectionOptions = {
  /*
   *  {
   *    label, // What goes in the menu.
   *    instanceIndex: [{ name, description, instance, database, cache, isJumpbox }]
   *  }
   */
}

async function CliRemotePrompted_2020_04_01(options) {

  // Load the profiles
  const homedir = require('os').homedir()
  const awsCredentialsFile = propertiesReader(`${homedir}/.aws/credentials`);
  const profileHash = {}
  awsCredentialsFile.each(propertyPath => {
    // console.log(`-> ${propertyPath}`);
    let pos = propertyPath.indexOf('.')
    if (pos > 0) {
      let section = propertyPath.substring(0, pos)
      profileHash[section] = true
    }
  })

  if (options.profile) {
    // Check the profile is valid
    //ZZZZ
    options.selectedProfile = options.profile
    // console.log(`Profile specified on command line: ${options.selectedProfile}`);
    var credentials = new AWS.SharedIniFileCredentials({ profile: options.selectedProfile });
    AWS.config.credentials = credentials;
  } else {
    // Prompt for the profile
    let defaultProfile = ''
    if (process.env['AWS_PROFILE']) {
      console.log(`Using environment variable AWS_PROFILE as default profile`);
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
    profileQuestion[0].pageSize = profileQuestion[0].choices.length + 2
    const selection = await inquirer.prompt(profileQuestion)
    options.selectedProfile = selection.profile
    // console.log(`options.selectedProfile is ${options.selectedProfile}\n`);

    var credentials = new AWS.SharedIniFileCredentials({ profile: options.selectedProfile });
    AWS.config.credentials = credentials;
  }

  // We need to choose a region so we can initialize, before we can select a list of regions. :-)
  myAWS.checkAwsRegion('ap-southeast-1');
  let regions = await myAWS.downloadRegions()

  // Choose a region
  if (options.region) {
    // Check the region is valid
    //ZZZZ
    // console.log(`Region specified on command line: ${options.region}`);
    options.selectedRegion = options.region
  } else {
    // Prompt for the region
    let defaultRegion = ''
    let defaultRegionDesc = ''
    if (process.env['AE_REGION']) {
      console.log(`Using environment variable AE_REGION as default profile`);
      defaultRegion = process.env['AE_REGION']
      defaultRegionDesc = ` [${defaultRegion}]`
    }
    const regionQuestion = [
      {
        type: 'list',
        name: 'region',
        message: `AWS region [${defaultRegionDesc}]?`,
        choices: [],
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
    regionQuestion[0].pageSize = regionQuestion[0].choices.length + 2
    const result = await inquirer.prompt(regionQuestion)
    options.selectedRegion = result.region
    // console.log(`options.selectedRegion is ${options.selectedRegion}\n`);
  }//- if
  const region = myAWS.checkAwsRegion(options.selectedRegion);
  const regionName = capitalize(myAWS.regionDescription(options.selectedRegion))



  // Get a list of things people might like to connect to
  console.error(`Gathering information...`);
  graph.reset();
  await download.downloadInstances()

  if (!options.skipEcs) {
    await download.downloadClusters()
  }

  await download.downloadDatabases()

  await download.downloadSecurityGroups()

  console.error(`done.\n`);

  let clist = graph.nodes().filter(node => (node.type === types.CLUSTER))
  let list = graph.nodes().filter(node => (node.type === types.INSTANCE))
  let dlist = graph.nodes().filter(node => (node.type === types.DATABASE))
  let slist = graph.nodes().filter(node => (node.type === types.SERVICE))
  let tlist = graph.nodes().filter(node => (node.type === types.TASK))
  // console.log(`clusters=`, clist);
  // console.log(`instances=`, list);
  // console.log(`databases=`, dlist);
  // console.log(`services=`, slist);
  // console.log(`tasks=`, tlist);
  tlist.forEach(task => {
    task.children.forEach(child => {
      if (child.startsWith(types.INSTANCE)) {
        // console.log(`- instance: ${child}`);
        const instance = graph.findNodeWithKey(child)
        addConnectionOption(`Service ${task.id}`, instance, task, null, null)
      }
    })
  })


  // Add clusters
  if (!options.skipEcs) {
    clist.forEach(cluster => {
      const instancePrefix = 'EC2 Instance::'
      cluster.children.forEach(childId => {
        // console.log(`   -> ${childId}`);
        if (childId.startsWith(instancePrefix)) {
          // console.log(`   MATCH`);
          const instanceId = childId.substring(instancePrefix.length)
          const instance = download.findInstanceById(instanceId)
          addConnectionOption(`Cluster ${cluster.id}`, instance, null, null, null)
        }
      })
    })
  }

  // Add instances, and the environment they are in
  list.forEach(instance => {
    // const instanceId = instance.id
    if (instance.data.State.Name === 'terminated') {
      return
    }
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
      addConnectionOption(`Environment ${environment}`, instance, null, null, null)
    }
    let id = instance.id
    if (description) {
      id = description
    }
    if (name) {
      id = name
    }
    let label
    if (instance.data._isJumpbox) {
      label = `Jumpbox ${id}`
    } else {
      label = `Instance ${id}`
    }
    if (instance.data.State.Name !== 'running') {
      label = `${label}  (${instance.data.State.Name})`.yellow
    }
    addConnectionOption(label, instance, null, null, null)
  })

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
        const dbSecGrp = graph.findNodeWithKey(parent)
        // console.log(`db grp=>\n`, dbSecGrp);
        dbSecGrp.parents.forEach(parent2 => {
          if (parent2.startsWith(`${types.SECGRP}::`)) {
            // console.log(`\n\n----- App secgrp is ${parent2}`);
            const appSecGrp = graph.findNodeWithKey(parent2)
            // console.log(`app grp=>\n`, appSecGrp);
            appSecGrp.children.forEach(child => {
              if (child.startsWith(`${types.INSTANCE}::`)) {
                // console.log(`INSTANCE IS ${child}`);
                const instance = graph.findNodeWithKey(child)
                addConnectionOption(`Database ${db.id}`, instance, null, db, null)
              }
            })
          }
        })
      }
    })
  })

  // Ask which environment, cluster, instance, etc
  const connectQuestion = [
    {
      type: 'list',
      name: 'connectionOption',
      message: 'What would you like to connect to?',
      choices: [],
    },
  ];
  for (let label in connectionOptions) {
    const connectionOption = connectionOptions[label]
    connectQuestion[0].choices.push({ name: ` ${label}`, value: connectionOption })
  }
  connectQuestion[0].choices.sort((l1, l2) => {
    if (l1.name > l2.name) return +1
    if (l1.name < l2.name) return -1
    return 0
  })
  connectQuestion[0].choices.push({ name: 'quit'.bold, value: 'quit' })
  connectQuestion[0].pageSize = connectQuestion[0].choices.length + 2

  for (; ;) {
    // Choose what to connect to
    const connectionResult = await inquirer.prompt(connectQuestion)
    options.selectedConnectionOption = connectionResult.connectionOption
    // console.log(`selectedConnectionOption=`, options.selectedConnectionOption);
    // Handle this connection.
    const reply = await selectInstanceFromConnection(options)
    if (reply === 'quit') {
      process.exit(0)
    }
  }
}


async function selectInstanceFromConnection(options) {
  // console.log(`selectInstanceFromConnection()`);

  // Count the number of instances.
  let numInstances = 0
  let firstInstanceReference = null  // { name, description, instance, task, database, cache, isJumpbox }
  for (let instanceId in options.selectedConnectionOption.instanceIndex) {
    numInstances++
    if (firstInstanceReference === null) {
      firstInstanceReference = options.selectedConnectionOption.instanceIndex[instanceId]
    }
  }

  if (numInstances == 1) {
    /*
     *  Only one instance.
     */
    options.selectedInstance = firstInstanceReference.instance
    options.selectedTask = firstInstanceReference.task
    options.selectedDatabase = firstInstanceReference.database
    options.selectedCache = firstInstanceReference.cache

    for (; ;) {
      let reply = await commandsForInstance(options)
      if (reply === 'back') {
        return 'back'
      }
    }
  }
  else {
    /*
     *  Multiple instances - select one.
     */
    const instanceQuestion = [
      {
        type: 'list',
        name: 'instanceReference',
        message: 'Instance?',
        choices: [],
      },
    ];
    for (let instanceId in options.selectedConnectionOption.instanceIndex) {
      const instanceReference = options.selectedConnectionOption.instanceIndex[instanceId] // { name, description, instance, database, cache, isJumpbox }

      const instance = download.findInstanceById(instanceId)
      if (instance.data.State.Name === 'terminated') {
        continue
      }
      let label = instanceId
      if (instanceReference.description) {
        label = instanceReference.description
      }
      if (instanceReference.name) {
        label = instanceReference.name
      }
      if (instanceReference.isJumpbox) {
        label = label.gray
      }
      if (instance.data.State.Name !== 'running') {
        label += `  (${instance.data.State.Name})`.gray
      }
      instanceQuestion[0].choices.push({ name: ` ${label}`, value: instanceReference })
    }
    instanceQuestion[0].choices.sort((i1, i2) => {
      if (i1.name < i2.name) return -1
      if (i1.name > i2.name) return +1
      return 0
    })
    instanceQuestion[0].choices.push({ name: 'back'.bold, value: 'back' })
    instanceQuestion[0].choices.push({ name: 'quit'.bold, value: 'quit' })
    instanceQuestion[0].pageSize = instanceQuestion[0].choices.length + 2

    // Ask what to do with the instance
    for (; ;) {
      const instanceResult = await inquirer.prompt(instanceQuestion)
      const instanceReference = instanceResult.instanceReference
      // console.log(`instanceReference:`, instanceReference);
      if (instanceReference === 'back') {
        // console.log(`go back from instance selection`);
        return 'back'
      } else if (instanceReference === 'quit') {
        process.exit(0)
      }
      // Hande this instance
      // console.log(`instanceResult=`, instanceResult);
      options.selectedInstance = instanceReference.instance
      options.selectedTask = instanceReference.task
      options.selectedDatabase = instanceReference.database
      options.selectedCache = instanceReference.cache

      let reply = await commandsForInstance(options)
      if (reply === 'back') {
        return 'back'
      }
    }
  }
}//- selectInstanceFromConnection


async function commandsForInstance(options) {
  return new Promise((resolve, reject) => {
    (async () => {
      try {

        const instance = options.selectedInstance
        const keyName = instance.data.KeyName
        const publicIpAddress = instance.data.PublicIpAddress

        // console.log(`instance is`, instance);
        // console.log(`State.Code:`, instance.data.State.Code);
        // console.log(`State.Name:`, instance.data.State.Name);

        // Display instance details.
        // console.log(`instance=`, instance);
        console.log(`\n\n  Instance ${instance.id}`.bold.blue)
        instance.data.Tags.forEach(tag => {
          if (tag.Key === 'Name') {
            console.log(`         Name: ${tag.Value}`.blue);
          } else if (tag.Key === 'Environment') {
            console.log(`  Environment: ${tag.Value}`.blue);
          }
        })
        // if (instance.data.KeyName) {
        //   console.log(`     Key name: ${instance.data.KeyName}`.blue);
        // }
        if (options.selectedTask) {
          console.log(`         Task: ${options.selectedTask.id}`.blue);
        }
        if (options.selectedDatabase) {
          // console.log(`db:`, options.selectedDatabase);
          console.log(`     Database: ${options.selectedDatabase.id}`.blue);
        }
        console.log(``);

        // Ask what they'd like to do.
        const opQuestion = [
          {
            type: 'list',
            name: 'operation',
            message: 'What would you like to do?',
            choices: [],
          },
        ];
        opQuestion[0].choices.push({ name: ' SSH over SSM - ' + 'login'.red, value: 'ssh-over-ssm-login' })
        opQuestion[0].choices.push({ name: ' SSH over SSM - ' + 'docker ps'.red, value: 'ssh-over-ssm-docker-ps' })
        if (options.selectedDatabase) {
          opQuestion[0].choices.push({ name: ' SSH over SSM - ' + 'mysql'.red, value: 'ssh-over-ssm-mysql' })
          opQuestion[0].choices.push({ name: ' SSH over SSM - ' + 'phpmyadmin'.red, value: 'ssh-over-ssm-phpmyadmin' })
        }
        if (options.selectedTask) {
          // const startTime = moment(options.selectedTask.data.startedAt).fromNow(true)
          // options.selectedTask.data.containers.forEach(container => {
          //   const containerId = container.runtimeId
          //   const shortId = shortContainerId()
          //   opQuestion[0].choices.push({ name: ' SSH over SSM - '+`connect to container (up ${startTime})`.red, value: 'ssh-over-ssm-task' })
          // })
          // const containerId = options.selectedTask.data.containers[0].runtimeId
          // const shortId = shortContainerId(containerId)
          const startTime = moment(options.selectedTask.data.startedAt).fromNow(true)
          opQuestion[0].choices.push({ name: ' SSH over SSM - ' + `${options.selectedTask.id} (up ${startTime})`.red, value: 'ssh-over-ssm-task' })
          // opQuestion[0].choices.push({ name: ' Export Logfile - ' + `${options.selectedTask.id}`.red, value: 'export-logfile' })
        }
        // opQuestion[0].choices.push({ name: 'SSH over SSM - '+'redis'.red, value: 'ssh-over-ssm-redis'})
        opQuestion[0].choices.push({ name: ' SSH over SSM - ' + 'open tunnel'.red, value: 'ssh-over-ssm-tunnel' })
        if (keyName && publicIpAddress) {
          opQuestion[0].choices.push({ name: ' SSH - login'.grey, value: 'ssh' })
        }
        opQuestion[0].choices.push({ name: ' SSM session - ' + 'login'.green, value: 'ssm' })
        opQuestion[0].choices.push({ name: ' SSM session - ' + 'docker ps'.green, value: 'docker-ps' })
        if (options.selectedTask) {
          opQuestion[0].choices.push({ name: ' Tail Logfile', value: 'tail-logfile' })
          opQuestion[0].choices.push({ name: ' View Logfile (latest 3 minutes)', value: 'view-logfile' })
          opQuestion[0].choices.push({ name: ' View Logfile (latest 30 minutes)', value: 'view-logfile-30minutes' })
          opQuestion[0].choices.push({ name: ' View Logfile (latest 3 hours)', value: 'view-logfile-3hours' })
          opQuestion[0].choices.push({ name: ' Export 3 hours of logfile', value: 'dump-logfile-3hours' })
          opQuestion[0].choices.push({ name: ' Export 3 days of logfile', value: 'dump-logfile-3days' })
          opQuestion[0].choices.push({ name: ' Export entire logfile', value: 'dump-logfile' })
        }
        opQuestion[0].choices.push({ name: 'back'.bold, value: 'back' })
        opQuestion[0].choices.push({ name: 'quit'.bold, value: 'quit' })
        opQuestion[0].pageSize = opQuestion[0].choices.length + 2
        const opResult = await inquirer.prompt(opQuestion)
        const operation = opResult.operation

        // Now run the selected operation
        if (operation === 'quit') {
          process.exit(0)
        } else if (operation === 'back') {
          return resolve('back')
        } else if (operation === 'ssm') {
          let command = `aws ssm start-session --region ${options.selectedRegion} --target ${instance.id}`
          console.error(``);
          console.error(`     ` + `AWS_PROFILE=${options.selectedProfile} ${command}`.dim)
          console.error(``);
          const startTime = Date.now()
          const child = spawn(command, {
            stdio: 'inherit',
            shell: true,
            env: { AWS_PROFILE: options.selectedProfile, PATH: '/usr/local/bin:/bin:/usr/bin' },
          });
          child.on('close', (code) => {
            console.log(`Session exited with code ${code}.`.ssm);
            if ((Date.now() - startTime) < 5000) {
              ssmWikiSuggestion()
            }
            resolve(null)
          });
          return
        } else if (operation === 'ssh-over-ssm-login') {
          /*
          *  Use SSM to set up a tunnel to port 22 INSIDE the instance.
          *  This will allow SSH commands to be run.
          */
          const { localPort, sessionId, keyfile } = await startTunnelForSSH(options, instance)
          if (sessionId === 'error') {
            // console.error(`\nUnable to set up tunnel.`);
            return resolve(null)
          } else {
            // Login
            let sshCmd = await sshCommand(instance, keyfile, localPort, '', '')
            const { exitCode } = await shellCommand(options, sshCmd)
            await closeTunnel(options, sessionId)
            await cleanUp()
            console.log(`\n\n`);
            return resolve(null)
          }
        } else if (operation === 'ssh-over-ssm-docker-ps') {
          /*
          *  Use SSM to set up a tunnel to port 22 INSIDE the instance.
          *  This will allow SSH commands to be run.
          */
          const { localPort, sessionId, keyfile } = await startTunnelForSSH(options, instance)
          if (sessionId === 'error') {
            return resolve(null)
          } else {
            // Do the login.
            const sshCmd = `ssh -i ${keyfile} -t -p ${localPort} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ec2-user@127.0.0.1 docker ps`
            const { exitCode } = await shellCommand(options, sshCmd)
            console.log(`\n\n`);
            await closeTunnel(options, sessionId)
            await cleanUp()
            console.log(`\n\n`);
            return resolve(null)
          }
        } else if (operation === 'ssh-over-ssm-mysql') {
          /*
          *  Use SSM to set up a tunnel to port 22 INSIDE the instance.
          *  Then SSH is used to run mysql inside docker.
          */
          const { localPort, sessionId, keyfile } = await startTunnelForSSH(options, instance)
          if (sessionId === 'error') {
            return resolve(null)
          } else {
            // Tunnel is running. Now start mysql.
            // console.log(`database is`, options.selectedDatabase);
            const dbhost = options.selectedDatabase.data.Endpoint.Address
            const dbQuestions = [
              {
                type: 'input',
                name: 'dbname',
                message: 'Database name?',
              },
              {
                type: 'input',
                name: 'username',
                message: 'User name?',
                default: 'admin'
              },
              {
                type: 'password',
                name: 'password',
                message: 'Password?',
              },
            ];
            const dbResult = await inquirer.prompt(dbQuestions)

            const dbname = dbResult.dbname
            const username = dbResult.username
            const password = dbResult.password
            const containerName = `mysql-${dbname}`
            const image = `mysql`
            const remoteCommand = `docker run -it --rm --name ${containerName} ${image}`
              + ` mysql`
              + ` -A`
              + ` -h ${dbhost}`
              + ` --ssl-mode=DISABLED`
              + ` -u ${username} -p${password}`
              + ` ${dbname}`
            const sshCmd = `ssh -i ${keyfile} -t -p ${localPort} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ec2-user@127.0.0.1 ${remoteCommand}`
            const { exitCode } = await shellCommand(options, sshCmd)
            await closeTunnel(options, sessionId)
            await cleanUp()
            console.log(`\n\n`);
            return resolve(null)
          }
        } else if (operation === 'ssh-over-ssm-phpmyadmin') {
          /*
          *  Use SSM to set up a tunnel to port 22 INSIDE the instance.
          *  Use SSH to run the remote command inside docker, while
          * port forwarding to the phpmyadmin port.
          */
          const { localPort, sessionId, keyfile } = await startTunnelForSSH(options, instance)
          if (sessionId === 'error') {
            // console.error(`\nUnable to set up tunnel.`);
            return resolve(null)
          } else {
            // Tunnel is running. Now start phpmyadmin.
            // console.log(`database is`, options.selectedDatabase);
            const dbhost = options.selectedDatabase.data.Endpoint.Address
            const webPort = await portfinder.getPortPromise({
              port: 23000,    // minimum port
              stopPort: 23999 // maximum port
            })
            const dbname = 'adlforms'
            const containerName = `mysql-${dbname}`
            const image = `phpmyadmin/phpmyadmin:4.6.4-1`
            console.log(`\n\n`
              + `          Open your browser at `.green.bold
              + `http://localhost:${webPort}`.blue.underline
              + ` to access phpmyadmin`.green.bold
              + `\n\n`);
            const remoteCommand = `docker run -it --rm -p ${webPort}:80 -e PMA_HOST=${dbhost} --name ${containerName} ${image}`
            let sshCmd = await sshCommand(instance, keyfile, localPort, webPort, remoteCommand)
            const { exitCode } = await shellCommand(options, sshCmd)
            await closeTunnel(options, sessionId)
            await cleanUp()
            console.log(`\n\n`);
            return resolve(null)
          }
        } else if (operation === 'ssh-over-ssm-task') {
          /*
           *  Connect to the Docker container inside the host instance.
           */
          // console.log(`task is`, options.selectedTask)
          // console.log(`containers:`, options.selectedTask.data.containers)
          if (options.selectedTask.data.containers.length === 1) {
            const container = options.selectedTask.data.containers[0]
            options.selectedContainerId = container.runtimeId
          } else {
            const taskQuestions = [
              {
                type: 'list',
                name: 'containerId',
                message: 'Container?',
                choices: []
              }
            ];
            options.selectedTask.data.containers.forEach(container => {
              const taskId = options.selectedTask.id
              const containerId = container.runtimeId
              console.log(`-> `, container);
              const shortId = shortContainerId(containerId)
              taskQuestions[0].choices.push({ name: ` ${taskId} - ${shortId}`, value: containerId })
            })
            const containerResult = await inquirer.prompt(taskQuestions)
            options.selectedContainerId = containerResult.containerId
          }

          // Connect via a tunnel
          const { localPort, sessionId, keyfile } = await startTunnelForSSH(options, instance)
          if (sessionId === 'error') {
            // console.error(`\nUnable to set up tunnel.`);
            return resolve(null)
          } else {
            // Tunnel is running. Now start a shell in the remote container.
            const shortId = shortContainerId(options.selectedContainerId)
            console.log(`\n\nLog into Docker container '${options.selectedTask.id}' (${shortId})\n`)
            const remoteCommand = `sudo docker exec -it ${shortId} /bin/bash`
            let sshCmd = await sshCommand(instance, keyfile, localPort, null, remoteCommand)
            const { exitCode } = await shellCommand(options, sshCmd)
            await closeTunnel(options, sessionId)
            await cleanUp()
            console.log(`\n\n`);
            return resolve(null)
          }
        } else if (operation === 'tail-logfile') {

          /*
           *  Tail a logfile for the selected task
           */
          createDumpfile = false
          askThenDumpCloudWatchLog(options, LOG_DURATION_TAIL, createDumpfile, function (err) {
            if (err) return reject(err)
            return resolve(null)
          })
        } else if (operation === 'view-logfile') {

          /*
           *  Export a logfile for the selected task
           */
          const duration = 3 * 60 // four minutes
          createDumpfile = false
          askThenDumpCloudWatchLog(options, duration, createDumpfile, function (err) {
            if (err) return reject(err)
            return resolve(null)
          })
        } else if (operation === 'view-logfile-30minutes') {

          /*
           *  Export a logfile for the selected task
           */
          const duration = 30 * 60
          createDumpfile = false
          askThenDumpCloudWatchLog(options, duration, createDumpfile, function (err) {
            if (err) return reject(err)
            return resolve(null)
          })
        } else if (operation === 'view-logfile-3hours') {

          /*
           *  Export a logfile for the selected task
           */
          const duration = 3 * 60 * 60 // four minutes
          createDumpfile = false
          askThenDumpCloudWatchLog(options, duration, createDumpfile, function (err) {
            if (err) return reject(err)
            return resolve(null)
          })
        } else if (operation === 'dump-logfile') {

          /*
           *  Export entire logfile for the selected task
           */
          createDumpfile = true
          askThenDumpCloudWatchLog(options, LOG_DURATION_ENTIRE_LOG, createDumpfile, function (err) {
            if (err) return reject(err)
            return resolve(null)
          })

        } else if (operation === 'dump-logfile-3hours') {

          /*
           *  Export latest 3 hours of a logfile for the selected task
           */
          createDumpfile = true
          const duration = 3 * 60 * 60 // four minutes
          askThenDumpCloudWatchLog(options, duration, createDumpfile, function (err) {
            if (err) return reject(err)
            return resolve(null)
          })

        } else if (operation === 'dump-logfile-3days') {

          /*
           *  Export latest 3 days of a logfile for the selected task
           */
          createDumpfile = true
          const duration = 3 * 24 * 60 * 60 // four minutes
          askThenDumpCloudWatchLog(options, duration, createDumpfile, function (err) {
            if (err) return reject(err)
            return resolve(null)
          })

        } else if (operation === 'ssh-over-ssm-redis') {
          // Not yet
          return resolve(null)
        } else if (operation === 'ssh-over-ssm-tunnel') {
          /*
          *  Use SSM to set up a tunnel to port 22 INSIDE the instance.
          *  Use SSH to run the remote command inside docker, while
          * port forwarding to the phpmyadmin port.
          */
          const { localPort, sessionId, keyfile } = await startTunnelForSSH(options, instance)
          if (sessionId === 'error') {
            // console.error(`\nUnable to set up tunnel.`);
            return resolve(null)
          } else {
            // Tunnel is running. Now start phpmyadmin.
            let sshCmd = await sshCommand(instance, keyfile, localPort, 0, '')
            console.log(`

              An SSH tunnel is now available to the remote server. Use the following command to connect through the tunnel:
              (The credentials will remain valid for 60 seconds)

              `.green.bold
              + `${sshCmd.blue}` + ` <remote-command-goes-here>`.blue.bold
              + `
            `);

            // Confirm finishing
            const closeQuestion = [
              {
                type: 'accept',
                name: 'closeTunnel',
                message: 'Close the tunnel?',
              },
            ];
            for (; ;) {
              console.log(``);
              console.log(`Press return when you are finished with the tunnel.`);
              console.log(``);
              console.log(``);
              const closeResult = await inquirer.prompt(closeQuestion)
              if (closeResult.closeTunnel) {
                break;
              }
            }

            // Close the tunnel.
            await closeTunnel(options, sessionId)
            await cleanUp()
            return resolve(null)
          }
        } else if (operation === 'ssh') {
          /*
          *  Login using SSH
          */
          const cmd = `ssh -i ~/.ssh/${keyName}.pem ec2-user@${publicIpAddress}`
          console.error(``);
          console.error(`     ` + cmd.dim)
          console.error(``);
          const startTime = Date.now()
          const child = spawn(cmd, {
            stdio: 'inherit',
            shell: true,
            env: { AWS_PROFILE: options.selectedProfile, PATH: '/usr/local/bin:/bin:/usr/bin' },
          });
          child.on('close', (code) => {
            console.log(`Session exited with code ${code}.`);
            if ((Date.now() - startTime) < 5000) {
              ssmWikiSuggestion()
            }
            resolve(null)
          });
          return
        } else if (operation === 'docker-ps') {

          // Start the command
          const remoteCommand = `sudo docker ps`
          const comment = remoteCommand
          try {
            let startReply = await runOverSsm.startRemoteCommand(options.selectedRegion, options.selectedProfile, instance.id, comment, remoteCommand)
            // console.log(`startReply=`, startReply);
            if (startReply.remoteStatus !== 'Pending') {
              console.error(`Failed to start remote command`);
              console.error(`Status: ${startReply.remoteStatus}`)
              // process.exit(1)
              return resolve(null)
            }
            // console.log(`Started okay`);
            let remoteCommandId = startReply.remoteCommandId
            let endReply = await runOverSsm.waitForRemoteCommand(options.selectedRegion, options.selectedProfile, remoteCommandId)
            // console.log(`endReply=`, endReply);
            if (endReply.remoteStatus !== 'Success') {
              console.error(`Failed to run remote command`);
              console.error(`Status: ${endReply.remoteStatus}`)
              if (endReply.output) {
                console.error(`Error message:\n${endReply.output}`)
              }
              return resolve(null)
            }
            console.log(endReply.output);
            return resolve(null)
          } catch (e) {
            console.error(e);
            return resolve(null)
          }
        } else {
          console.log(`Unknown operation ${operation}`);
        }
      } catch (err) {
        reject(err)
      }
    })()//- call async function immediately
  })//- Promise
}//- commandsForInstance

const addConnectionOption = (label, instance, task, database, cache) => {
  let entry = connectionOptions[label]
  if (!entry) {
    entry = {
      label,
      instanceIndex: {} // instanceId => { name, description, database, isJumpbox }
    }
    connectionOptions[label] = entry
  }
  let name
  let description
  instance.data.Tags.forEach(tag => {
    if (tag.Key == 'Name') { name = tag.Value };
    if (tag.Key == 'Description') { description = tag.Value };
  })
  const isJumpbox = (instance.data._isJumpbox) ? 1 : 0;
  entry.instanceIndex[instance.id] = { name, description, instance, task, database, cache, isJumpbox }
};// addConnectionOption



function ssmWikiSuggestion() {
  console.log(`

      It looks like something might have gone wrong. For instructions on how to set up
      and debug SSM connections, consult the aws-explorer wiki:
      `.bold.red
    + `https://github.com/tooltwist/aws-explorer/wiki/Setting-up-and-debugging-AWS-SSM`.blue.underline
    + `

      `);
}


/*
 *  Start a tunnel with SSM.
 *  See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SSM.html#terminateSession-property
 */
async function startTunnelForSSH(options, instance) {
  // console.log(`startTunnelForSSH()`);
  // console.log(`startTunnelForSSH()`, instance);

  return new Promise((resolve, reject) => {
    (async () => {
      try {
        // let localPort = 22000 + (Math.floor(Math.random() * 1000))
        const localPort = await portfinder.getPortPromise({
          port: 22000,    // minimum port
          stopPort: 22999 // maximum port
        })

        let keyfile
        if (USE_TEMPORARY_KEYFILE) {

          // Generate a temporary keypair, if it doesn't already exist.
          await cleanUp()
          keyfile = temporaryKeypairFile()
          const publicKeyfile = `${keyfile}.pub`
          const keypairCmd = `ssh-keygen -t rsa -f ${keyfile} -N ''`
          console.error(``);
          console.error(`     ` + `${keypairCmd}`.dim)
          try {
            execSync(keypairCmd)
          } catch (e) {
            console.log(`Error while generating keypair:`, e);
            resolve({ localPort: -1, sessionId: 'error', keyfile: null })
          }

          // Send the keypair to AWS
          // See https://nullsweep.com/a-better-way-to-ssh-in-aws/
          // See https://awscli.amazonaws.com/v2/documentation/api/latest/reference/ec2-instance-connect/send-ssh-public-key.html
          let sendKeyCmd = `aws ec2-instance-connect send-ssh-public-key`
            + ` --instance-id ${instance.id}`
            + ` --instance-os-user ec2-user`
            + ` --availability-zone ${instance.data.Placement.AvailabilityZone}`
            + ` --ssh-public-key file://${publicKeyfile}`
          console.error(`     ` + `AWS_PROFILE=${options.selectedProfile} ${sendKeyCmd}`.dim)
          // console.log(`\n\n\n\n\n HERE WE GO....\n\n\n`)
          try {
            execSync(sendKeyCmd, { env: { AWS_PROFILE: options.selectedProfile } })
          } catch (e) {
            console.log(`Error while generating keypair:`, e);
            resolve({ localPort: -1, sessionId: 'error', keyfile: null })
          }

          // Wait a short while.
          await sleep(2000)
        } else {

          // Use the normal instance keypair
          keyfile = `~/.ssh/${instance.data.KeyName}.pem`
        }

        // Start the tunnel
        // aws ssm start-session --target %h --document AWS-StartSSHSession --parameters portNumber=%p --region=eu-west-1
        let command = `aws ssm start-session`
          + ` --region ${options.selectedRegion}`
          + ` --target ${instance.id}`
          + ` --document-name AWS-StartPortForwardingSession`
          + ` --parameters '{"portNumber":["22"],"localPortNumber":["${localPort}"]}'`
        console.error(`     ` + `AWS_PROFILE=${options.selectedProfile} ${command}`.dim)
        const startTime = Date.now()
        // let stdout = ''
        const child = spawn(command, {
          // stdio: 'inherit',
          shell: true,
          env: { AWS_PROFILE: options.selectedProfile, PATH: '/usr/local/bin:/bin:/usr/bin' },
        });

        // Hopefully we'll get a session ID from the output, but we have a timeout just in case.
        let timer = setTimeout(() => {
          console.log(`Timeout while waiting for session ID in output of aws cli command.`);
          resolve({ localPort, sessionId: 'error', keyfile: null })
        }, 15000)
        child.stdout.on('data', (data) => {
          data = data.toString() // Convert buffer to string
          process.stdout.write(data.dim);

          // Look for a sucessful start
          // "Starting session with SessionId: philip.callender-0d281b92d275af27a"
          // "Port 22372 opened for sessionId philip.callender-0b12c1afb02095da3."
          const match = /Port (\d+) opened for sessionId (.*)./.exec(data);
          // console.log(`match is `, match);
          if (match) {
            clearTimeout(timer)
            resolve({ localPort: match[1], sessionId: match[2], keyfile })
          }
        });

        // Handle stderr
        child.stderr.on('data', (data) => {
          data = data.toString() // Convert buffer to string
          // console.log(data.red);
          process.stdout.write(data.red.dim);
          // Look for a connection error - "An error occurred (TargetNotConnected)..."
          if (data.indexOf('An error occurred (TargetNotConnected)') >= 0) {
            clearTimeout(timer)
            ssmWikiSuggestion()
            resolve({ localPort, sessionId: 'error', keyfile: null })
          }
        });
        child.on('close', (code) => {
          // console.log(`Tunnel exited with code ${code}.`);
          // if ((Date.now() - startTime) < 5000) {
          //   ssmWikiSuggestion()
          // }
        });
      } catch (err) {
        reject(err)
      }
    })()//- call async function immediately
  })//- Promise


}// startTunnelForSSH

function askThenDumpCloudWatchLog(options, duration, createDumpfile, callback) {
  // console.log(`askThenDumpCloudWatchLog(${duration})`)

  // console.log(`task is`, options.selectedTask)
  // console.log(`.containers`, options.selectedTask.data.containers)
  // console.log(`.overrides`, options.selectedTask.data.overrides)

  myAWS.ecs().describeTaskDefinition({
    taskDefinition: options.selectedTask.data.taskDefinitionArn
  }, function (err, taskDefinition) {
    if (err) return callback(err);
    // console.log('taskList=', taskList); // successful response
    // if (taskList.taskArns.length === 0) {
    //   return callback(null, []); // No tasks
    // }
    // console.log(`taskDefinition=`, taskDefinition)
    // console.log(`.requiresAttributes=`, taskDefinition.taskDefinition.requiresAttributes)
    // console.log(`.containerDefinitions=`, taskDefinition.taskDefinition.containerDefinitions)
    // console.log(`.logConfiguration=`, taskDefinition.taskDefinition.containerDefinitions[0].logConfiguration)
    var logConfiguration = null
    for (const container of taskDefinition.taskDefinition.containerDefinitions) {
      const lc = container.logConfiguration
      if (lc.logDriver === 'awslogs') {
        logConfiguration = lc
        break
      }
    }
    if (!logConfiguration) {
      console.log(`No log group found`)
      return callback(null)
    }
    const group = logConfiguration.options['awslogs-group']
    // const region = logConfiguration.options['awslogs-region']
    const streamPrefix = logConfiguration.options['awslogs-stream-prefix']
    // console.log(`group=`, group)
    // console.log(`streamPrefix=`, streamPrefix)

    // See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html#describeLogStreams-property
    var params = {
      logGroupName: group, /* required */
      descending: true,
      limit: 10,
      // logStreamNamePrefix: streamPrefix,
      // nextToken: 'STRING_VALUE',
      orderBy: 'LastEventTime',
    };
    myAWS.CloudWatchLogs().describeLogStreams(params, async function (err, data) {
      if (err) return reject(err)
      // else console.log(data);           // successful response

      // Ask what they'd like to do.
      const opQuestion = [
        {
          type: 'list',
          name: 'operation',
          message: 'Which log stream?',
          choices: [],
        },
      ];

      for (const stream of data.logStreams) {
        const m = moment(stream.lastEventTimestamp)
        const desc = `${stream.logStreamName.blue}  ${m.format('YYYY-MM-DD HH:mm:ss')}  ${m.fromNow().gray}`
        opQuestion[0].choices.push({ name: desc, value: { name: stream.logStreamName, lastEventTimestamp: stream.lastEventTimestamp } })
        // console.log(desc)
      }
      const logResult = await inquirer.prompt(opQuestion)
      // console.log(`logResult=`, logResult)
      const streamName = logResult.operation.name
      const lastEventTimestamp = logResult.operation.lastEventTimestamp
      // console.log(`streamName=`, streamName)

      var dumpFile = null
      var startTime = 0
      const endTime = 0
      const startToken = null
      if (createDumpfile) {
        const dumpFile = `/tmp/${streamName.replace(/\//g, "_")}_${moment(lastEventTimestamp).format('YYYYMMDD_HHmmss')}.txt`
        console.log()
        console.log()
        console.log()
        console.log(`Exporting to ${dumpFile}`)
        console.log()
        console.log()
        console.log()
        try {
          fs.unlinkSync(dumpFile) // In case it already exists
        } catch (e) { /* do nothing */ }
        if (duration !== LOG_DURATION_ENTIRE_LOG) {
          startTime = lastEventTimestamp - (duration * 1000)
        }
        dumpCloudWatchLog_2(group, streamName, startTime, endTime, startToken, dumpFile, callback)
      } else if (duration === LOG_DURATION_TAIL) {

        /*
         *  Tail the end of the logfile.
         */
        console.log()
        console.log()
        console.log(`Press Control-C to exit`)
        console.log()
        console.log()
        setTimeout(function() {
          dumpFile = 'tail'
          startTime = lastEventTimestamp - (60 * 1000) // Last minute
          dumpCloudWatchLog_2(group, streamName, startTime, endTime, startToken, dumpFile, callback)
        }, 3000)
      } else {
        startTime = lastEventTimestamp - (duration * 1000)
        dumpCloudWatchLog_2(group, streamName, startTime, endTime, startToken, dumpFile, callback)
      }


    })//- describeLogStreams
  })//- describeTaskDefinition
}


function dumpCloudWatchLog_2(group, streamName, startTime, endTime, nextToken, dumpFile, callback) {
  // console.log(`dumpCloudWatchLog_2(${nextToken}, ${dumpFile})`)

  // Download the log file
  var params = {
    logGroupName: group, /* required */
    logStreamName: streamName, /* required */
    // endTime: 'NUMBER_VALUE',
    limit: 1000,
    // nextToken: 'STRING_VALUE',
    startFromHead: true,
    // startTime: 'NUMBER_VALUE'
  };
  if (startTime) {
    params.startTime = startTime
  }
  if (endTime) {
    params.endTime = endTime
  }
  if (nextToken) {
    params.nextToken = nextToken
  }
  // console.log(`params=`, params)
  myAWS.CloudWatchLogs().getLogEvents(params, function (err, data) {
    if (err) return callback(err); // an error occurred
    // else     console.log(data)          // successful response
    var finalTime = startTime
    for (const event of data.events) {
      const m = moment(event.timestamp)
      // const str = `${event.timestamp}    ${m.format('YYYY-MM-DD HH:mm:ss')}   ${event.message}`
      const str = `${m.format('YYYY-MM-DD HH:mm:ss')}  -  ${event.message}`
      if (dumpFile && dumpFile !== 'tail') {
        fs.appendFileSync(dumpFile, `${str}\n`)
      } else {
        console.log(str)
      }
      finalTime = event.timeStamp + 1
    }
    if (data.events.length > 0 && data.nextForwardToken) {
      // Get more
      nextToken = data.nextForwardToken
      dumpCloudWatchLog_2(group, streamName, startTime, endTime, nextToken, dumpFile, callback)
    } else if (dumpFile === 'tail') {
      // Tailing - Wait a bit and maybe get some more
      // console.log(`TAIL... wait a bit`)
      setTimeout(function() {
        startTime = finalTime
        dumpCloudWatchLog_2(group, streamName, startTime, endTime, nextToken, dumpFile, callback)
      }, 3000)
    } else {
      // We're done.
      return callback(null)
    }
  });
}


function temporaryKeypairFile() {
    return `/tmp/aws-explorer-keypair-${process.pid}`
  }

async function cleanUp() {
    // console.log(`closeTunnel()`);
    return new Promise((resolve, reject) => {

      // Remove the temporary keypair
      const keypairFile = temporaryKeypairFile()
      console.error(`     ` + `rm ${keypairFile} ${keypairFile}.pub`.dim);
      try {
        fs.unlinkSync(`${keypairFile}`)
        fs.unlinkSync(`${keypairFile}.pub`)
      } catch (e) {
        // ignore the error
      }
      resolve(null)
    })//- promise
  }//- closeTunnel

async function closeTunnel(options, sessionId) {
    // console.log(`closeTunnel()`);
    return new Promise((resolve, reject) => {

      // // Remove the temporary keypair
      // const keypairFile = temporaryKeypairFile()
      // console.error(`     ` + `rm ${keypairFile} ${keypairFile}.pub`.dim);
      // try {
      //   fs.unlinkSync(`${keypairFile}`)
      //   fs.unlinkSync(`${keypairFile}.pub`)
      // } catch (e) {
      //   // ignore the error
      // }

      var params = {
        SessionId: sessionId
      };
      myAWS.ssm().terminateSession(params, function (err, data) {
        if (err) {
          console.log(`terminateSession error:`);
          console.log(err, err.stack); // an error occurred
          reject(err)
        }
        else {
          // console.log(data);           // successful response
          // Give the tunnel time to write it's exit status.
          setTimeout(() => {
            resolve(null)
          }, 500)
        }
      });
    })//- promise
  }//- closeTunnel

async function sshCommand(instance, keyfile, localPort, forwardPort, remoteCommand) {
    // console.log(`sshCommand: `, instance);
    // console.log(`KeyName is ${instance.data.KeyName}`);

    const command = `ssh -t`
      + ` -p ${localPort}`
      // + (instance.data.KeyName ? ` -i ~/.ssh/${instance.data.KeyName}.pem` : ``)
      + (keyfile ? ` -i ${keyfile}` : ``)
      + (forwardPort ? ` -L ${forwardPort}:127.0.0.1:${forwardPort}` : ``)
      + ` -o StrictHostKeyChecking=no`
      + ` -o UserKnownHostsFile=/dev/null`
      + ` ec2-user@127.0.0.1`
      + ` ${remoteCommand}`
    // console.log(`Remote command is ${command}`);
    return command
  }


async function shellCommand(options, command) {
    return new Promise((resolve, reject) => {

      console.error(``);
      console.error(`     ` + `${command}`.dim)
      console.error(``);
      // const sshStartTime = Date.now()
      const child = spawn(command, {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, AWS_PROFILE: options.selectedProfile },
      });
      child.on('close', (code) => {
        // console.log(`Command exited with code ${code}.`);
        // if ((Date.now() - sshStartTime) < 5000) {
        //   ssmWikiSuggestion()
        // }
        resolve({ exitCode: code })
      });
    })//- promise
  }


async function sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }

function shortContainerId(containerId) {
    return containerId.substring(0, 12)
  }


async function parseCommandLine(callback/*(unknownCommand, useDefault)*/) {

    // console.log(`YYYYY YAAAARRRRRPPPPP  CLIremote()`);

    /*
     *  Main thread starts here.
     */
    let haveCommand = false
    program
      .version('v2')
      .option('-e, --environment <env>', 'Environment')
      .option(`-p, --profile <profile>`, 'Profile')
      .option(`-r, --region <region>`, 'Region')
      .option(`-s, --skip-ecs`, 'Skip ECS')

    // Access database via a jump box
    program
      .command('remote')
      .description('Connect to AWS instances')
      .action(function () {
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
