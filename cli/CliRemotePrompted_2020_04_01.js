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
const colors = require('colors')
const CliMysql = require('./CliMysql')
// const phpmyadminOperation = require('./phpmyadminOperation')
const runOverSsm = require('./runOverSsm')
const portfinder = require('portfinder');

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

  if (options.profile) {
    // Check the profile is valid
    //ZZZZ
    options.selectedProfile = options.profile
    // console.log(`Profile specified on command line: ${options.selectedProfile}`);
    var credentials = new AWS.SharedIniFileCredentials({profile: options.selectedProfile});
    AWS.config.credentials = credentials;
  } else {
    // Prompt for the profile
    let defaultProfile = ''
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
    options.selectedProfile = selection.profile
    // console.log(`options.selectedProfile is ${options.selectedProfile}\n`);

    var credentials = new AWS.SharedIniFileCredentials({profile: options.selectedProfile});
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
    options.selectedRegion = result.region
    // console.log(`options.selectedRegion is ${options.selectedRegion}\n`);
  }//- if
  const region = myAWS.checkAwsRegion(options.selectedRegion);
  const regionName = capitalize(myAWS.regionDescription(options.selectedRegion))


  

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
  if (!options.skipEcs) {
    await download.downloadClusters()
  }
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
  if (!options.skipEcs) {
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
  }

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

  console.log(`${numInstances} instances`);
  if (numInstances == 1) {
    // Select the only instance available.
    options.selectedInstanceId = firstInstanceId
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
      if (record.isJumpbox) {
        label = label.gray
      }
      instanceQuestion[0].choices.push({ name: label, value: instanceId })
    }
    instanceQuestion[0].choices.sort((i1, i2) => {
      if (i1.name < i2.name) return -1
      if (i1.name > i2.name) return +1
      return 0
    })
    const instanceResult = await inquirer.prompt(instanceQuestion)
    // console.log(`instanceResult=`, instanceResult);
    options.selectedInstanceId = instanceResult.instanceId
  }
  // const instance = download.findInstanceById(options.selectedInstanceId)
  // console.log(`SELECTED INSTANCE=\n`, instance);


  // Ask what to do with the instance
  for ( ; ; ) {
    await commandsForInstance(options)
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

async function commandsForInstance(options) {

return new Promise(async (resolve, reject) => {


  const instance = download.findInstanceById(options.selectedInstanceId)
  const keyName = instance.data.KeyName
  const state = instance.data.State.Name
  const publicDns = instance.data.PublinDnsName
  const publicIpAddress = instance.data.PublicIpAddress
  // const state = instance.data.Monitoring.State
  // const state = instance.data.Monitoring.State
  // console.log(`keyName=${keyName}, state=${state}, publicDns=${publicDns}, publicIpAddress=${publicIpAddress}`);
    // Ask which environment
  const opQuestion = [
    {
      type: 'list',
      name: 'operation',
      message: 'What would you like to do?',
      // choices: Object.keys(environmentsAndClusters).sort(),
      choices: [ ],
    },
  ];
  opQuestion[0].choices.push({ name: 'SSH over SSM - '+'login'.red, value: 'ssh-over-ssm-login'})
  opQuestion[0].choices.push({ name: 'SSH over SSM - '+'docker ps'.red, value: 'ssh-over-ssm-docker-ps'})
  opQuestion[0].choices.push({ name: 'SSH over SSM - '+'mysql'.red, value: 'ssh-over-ssm-mysql'})
  opQuestion[0].choices.push({ name: 'SSH over SSM - '+'phpmyadmin'.red, value: 'ssh-over-ssm-phpmyadmin'})
  opQuestion[0].choices.push({ name: 'SSH over SSM - '+'redis'.red, value: 'ssh-over-ssm-redis'})
  if (keyName && publicIpAddress) {
    opQuestion[0].choices.push({ name: 'SSH - login'.grey, value: 'ssh'})
  }
  opQuestion[0].choices.push({ name: 'SSM session - '+'login'.green, value: 'ssm'})
  opQuestion[0].choices.push({ name: 'SSM session - '+'docker ps'.green, value: 'docker-ps'})
  // opQuestion[0].choices.push({ name: 'SSH over SSM - ?', value: 'ssh-ssm'})

  // opQuestion[0].choices.push({ name: 'Port forward - ?', value: 'port-forward'})
  // opQuestion[0].choices.push({ name: 'Start phpmyadmin', value: 'start-phpmyadmin'})
  // opQuestion[0].choices.push({ name: 'Port forward to phpmyadmin ? ', value: 'port-forward-tophpmyadmin'})
  opQuestion[0].choices.push({ name: 'quit', value: 'quit'})
  opQuestion[0].pageSize = opQuestion[0].choices.length + 2

  const opResult = await inquirer.prompt(opQuestion)
  // console.log(`opResult=`, opResult);
  const operation = opResult.operation

  // Now run the selected operation
  if (operation === 'quit') {
    process.exit(0)
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
      console.log(`Session exited with code ${code}.`);
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
    const { localPort, sessionId } = await startTunnelForSSH(options, instance)
    if (sessionId === 'error') {
      // console.error(`\nUnable to set up tunnel.`);
      return resolve(null)
    } else {
      // console.log(`Tunnel is running. localport=${localPort}, sessionId=${sessionId}`);
      // await sleep(2000)

      // DO LOGIN
      const sshCmd = `ssh -t -p ${localPort} ec2-user@127.0.0.1`
      const { exitCode } = await shellCommand(options, sshCmd)
      console.log(`\n\n`);
      await closeTunnel(options, sessionId)
      return resolve(null)
    }
  } else if (operation === 'ssh-over-ssm-docker-ps') {
    /*
     *  Use SSM to set up a tunnel to port 22 INSIDE the instance.
     *  This will allow SSH commands to be run.
     */
    const { localPort, sessionId } = await startTunnelForSSH(options, instance)
    if (sessionId === 'error') {
      // console.error(`\nUnable to set up tunnel.`);
      return resolve(null)
    } else {
      // console.log(`Tunnel is running. localport=${localPort}, sessionId=${sessionId}`);
      // await sleep(2000)

      // DO LOGIN
      const sshCmd = `ssh -t -p ${localPort} ec2-user@127.0.0.1 docker ps`
      const { exitCode } = await shellCommand(options, sshCmd)
      console.log(`\n\n`);
      await closeTunnel(options, sessionId)
      return resolve(null)
    }
  } else if (operation === 'ssh-over-ssm-mysql') {
    /*
     *  Use SSM to set up a tunnel to port 22 INSIDE the instance.
     *  Then SSH is used to run mysql inside docker.
     */
    const { localPort, sessionId } = await startTunnelForSSH(options, instance)
    if (sessionId === 'error') {
      // console.error(`\nUnable to set up tunnel.`);
      return resolve(null)
    } else {
      // Tunnel is running. Now start phpmyadmin.
      const dbhost = `test-juiceconfig.cyazdhriukql.ap-southeast-1.rds.amazonaws.com`
      const image = `mysql`
      const username = 'admin'
      const password = 'M0use123'
      const dbname = 'adlforms'
      const containerName = `phpmyadmin-${dbname}`

      // const webPort = await portfinder.getPortPromise({
      //   port: 23000,    // minimum port
      //   stopPort: 23999 // maximum port
      // })
      // const webPort = 23000 + (Math.floor(Math.random() * 1000))
      const remoteCommand = `docker run -it --rm --name ${containerName} ${image}`
        + ` mysql`
        + ` -A`
        + ` -h ${dbhost}`
        + ` --ssl-mode=DISABLED`
        + ` -u ${username} -p${password}`
        + ` ${dbname}`
      const sshCmd = `ssh -t -p ${localPort} ec2-user@127.0.0.1 ${remoteCommand}`
      const { exitCode } = await shellCommand(options, sshCmd)
      console.log(`\n\n`);
      await closeTunnel(options, sessionId)
      return resolve(null)
    }
  } else if (operation === 'ssh-over-ssm-phpmyadmin') {
    /*
     *  Use SSM to set up a tunnel to port 22 INSIDE the instance.
     *  Use SSH to run the remote command inside docker, while
     * port forwarding to the phpmyadmin port.
     */
    const { localPort, sessionId } = await startTunnelForSSH(options, instance)
    if (sessionId === 'error') {
      // console.error(`\nUnable to set up tunnel.`);
      return resolve(null)
    } else {
      // Tunnel is running. Now start phpmyadmin.
      const dbhost = `test-juiceconfig.cyazdhriukql.ap-southeast-1.rds.amazonaws.com`
      const image = `phpmyadmin/phpmyadmin:4.6.4-1`
      // const webPort = 23000 + (Math.floor(Math.random() * 1000))
      const webPort = await portfinder.getPortPromise({
        port: 23000,    // minimum port
        stopPort: 23999 // maximum port
      })
      const dbname = 'adlforms'
      const containerName = `mysql-${dbname}`
      console.log(`\n\n`
        + `          Open your browser at `.green.bold
        + `http://localhost:${webPort}`.blue.underline
        + ` to access phpmyadmin`.green.bold
        + `\n\n`);
      const remoteCommand = `docker run -it --rm -p ${webPort}:80 -e PMA_HOST=${dbhost} --name ${containerName} ${image}`
      const sshCmd = `ssh -t -p ${localPort} -L ${webPort}:127.0.0.1:${webPort} ec2-user@127.0.0.1 ${remoteCommand}`
      const { exitCode } = await shellCommand(options, sshCmd)
      console.log(`\n\n`);  
      await closeTunnel(options, sessionId)
      return resolve(null)
    }
  // } else if (operation === 'ssh-ssm') {
  //   /*
  //    *  Set up an SSH session over SSM connection
  //    */
  //   let command = `aws ssm start-session`
  //     + ` --region ${options.selectedRegion}`
  //     + ` --target ${instance.id}`
  //     + ` --document-name AWS-StartSSHSession`
  //   console.error(``);
  //   console.error(`     ` + `AWS_PROFILE=${options.selectedProfile} ${command}`.dim)
  //   console.error(``);
  //   const startTime = Date.now()
  //   const child = spawn(command, {
  //     stdio: 'inherit',
  //     shell: true,
  //     env: { AWS_PROFILE: options.selectedProfile, PATH: '/usr/local/bin:/bin:/usr/bin' },
  //   });
  //   child.on('close', (code) => {
  //     console.log(`Session exited with code ${code}.`);
  //     if ((Date.now() - startTime) < 5000) {
  //       ssmWikiSuggestion()
  //     }
  //     resolve(null)
  //   });
  //   return

  // } else if (operation === 'start-phpmyadmin') {
  //   console.log(`operation is ${operation}`);
  //   console.log(`zzzzz`, phpmyadminOperation);
  //   await phpmyadminOperation.startPhpMyAdmin(options, instance)
  //   return
  // } else if (operation === 'port-forward-tophpmyadmin') {
  //   console.log(`operation is ${operation}`);
  //   await phpmyadminOperation.forwardToPhpMyAdmin(options, instance)
  //   return
  // } else if (operation === 'port-forward') {
  //   /*
  //    *  Set up a port forwarding
  //    */
  //   const localPort = 3308
  //   const remotePort = 3308
  //   const command = `aws ssm start-session`
  //     + ` --region ${options.selectedRegion}`
  //     + ` --target ${instance.id}`
  //     + ` --document-name AWS-StartPortForwardingSession`
  //     + ` --parameters '{"portNumber":["${remotePort}"],"localPortNumber":["${localPort}"]}'`
  //   console.error(``);
  //   console.error(`     ` + `AWS_PROFILE=${options.selectedProfile} ${command}`.dim)
  //   console.error(``);
  //   const startTime = Date.now()
  //   const child = spawn(command, {
  //     stdio: 'inherit',
  //     shell: true,
  //     env: { AWS_PROFILE: options.selectedProfile, PATH: '/usr/local/bin:/bin:/usr/bin' },
  //   });
  //   child.on('close', (code) => {
  //     console.log(`\nSession closed.`);
  //     if ((Date.now() - startTime) < 5000) {
  //       ssmWikiSuggestion()
  //     }
  //     resolve(null)
  //   });
  //   child.on('exit', (code) => {
  //     console.log(`\nSession exited.`);
  //     // if ((Date.now() - startTime) < 5000) {
  //     //   ssmWikiSuggestion()
  //     // }
  //     // resolve(null)
  //   });

  //   // let tunnelCmd = `ssh -nNT -i ${keyfile} -L ${localPort}:${ip2}:22 ec2-user@${ip1} -L ${httpPort}:${ip2}:${phpmyadminPort} ec2-user@${ip1}      `
  //   // let loginCmd = `ssh -t -i ${keyfile} -p ${localPort} ec2-user@127.0.0.1       `
  //   // let mysqlCmd = `ssh -t -i ${keyfile} -p ${localPort} ec2-user@127.0.0.1 docker run -it --rm mysql mysql -h ${dbhost}  -u ${username} -p${password} ${dbname}       `
  //   // let phpmyadminCmd = `ssh -t -i ${keyfile} -p ${localPort} ec2-user@127.0.0.1 docker run -it --rm -p ${phpmyadminPort}:80 -e PMA_HOST=${dbhost} phpmyadmin/phpmyadmin:4.6.4-1        `
  //   // docker run -it --rm -p ${phpmyadminPort}:80 -e PMA_HOST=${dbhost} phpmyadmin/phpmyadmin:4.6.4-1        `
  

  //   setTimeout(async () => {
  //     console.log(``);
  //     console.log(``);
  //     const killQuestion = [
  //       {
  //         type: 'confirm',
  //         name: 'dropConnection',
  //         message: 'Drop the connection?',
  //         // choices: Object.keys(environmentsAndClusters).sort(),
  //         // choices: [
  
  //         // ],
  //       },
  //     ];
  //     for ( ; ; ) {
  //       const killResult = await inquirer.prompt(killQuestion)
  //       console.log(`killResult=`, killResult);
  //       if (killResult.dropConnection) {
  //         child.kill('SIGHUP')
  //         return
  //       }
  //     }
  //   }, 3000)
  



  //   return
  } else if (operation === 'ssh') {
    /*
     *  Login using SSH
     */
    const cmd = `ssh -i ~/.ssh/${keyName}.pem ec2-user@${publicIpAddress}`
    console.error(``);
    console.error(`     `+cmd.dim)
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
      let startReply = await runOverSsm.startRemoteCommand(options.selectedProfile, instance.id, comment, remoteCommand)
      // console.log(`startReply=`, startReply);
      if (startReply.remoteStatus !== 'Pending') {
        console.error(`Failed to start remote command`);
        console.error(`Status: ${startReply.remoteStatus}`)
        // process.exit(1)
        return resolve(null)
      }
      // console.log(`Started okay`);      
      let remoteCommandId = startReply.remoteCommandId
      let endReply = await runOverSsm.waitForRemoteCommand(options.selectedProfile, remoteCommandId)
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
})

}//- commandsForInstance

function ssmWikiSuggestion() {
  console.log(`

      It looks like something might have gone wrong. For instructions on how to set up
      and debug SSM connections, consult the aws-explorer wiki:
      `.bold.red
      + `https://github.com/tooltwist/aws-explorer/wiki/Setting-up-and-debugging-AWS-SSM`.blue.underline
      + `

      `);
}


async function startTunnelForSSH(options, instance) {
  // console.log(`startTunnelForSSH()`);

  return new Promise(async (resolve, reject) => {
    // let localPort = 22000 + (Math.floor(Math.random() * 1000))
    const localPort = await portfinder.getPortPromise({
      port: 22000,    // minimum port
      stopPort: 22999 // maximum port
    })


    // // AWS has not implemented this in the SDK yet
    // var params = {
    //   Target: instance.id,
    //   DocumentName: 'AWS-StartPortForwardingSession',
    //   Parameters: {
    //     portNumber: ["22"],
    //     localPortNumber: [`${localPort}`],
    //   }
    // };
    // myAWS.ssm().startSession(params, function(err, data) {
    //   if (err) {
    //     console.log(`\n\n\n\nSESSION ERROR`);
    //     console.log(err, err.stack); // an error occurred
    //     reject(err)
    //   }
    //   else {
    //     console.log(`\n\n\n\nSESSION STARTED`);
    //     console.log(data);           // successful response
    //     console.log(`\n\n\n\n\n`);
    //     resolve({ localPort, sessionId: data.sessionId })
    //   }
    // });


    let command = `aws ssm start-session`
      + ` --region ${options.selectedRegion}`
      + ` --target ${instance.id}`
      + ` --document-name AWS-StartPortForwardingSession`
      + ` --parameters '{"portNumber":["22"],"localPortNumber":["${localPort}"]}'`
    console.error(``);
    console.error(`     ` + `AWS_PROFILE=${options.selectedProfile} ${command}`.dim)
    console.error(``);
    const startTime = Date.now()
    // let stdout = ''
    const child = spawn(command, {
      // stdio: 'inherit',
      shell: true,
      env: { AWS_PROFILE: options.selectedProfile, PATH: '/usr/local/bin:/bin:/usr/bin' },
    });

    // Hopefully we'll get a session ID from the output, but we have
    // a timeout just in case.
    let timer = setTimeout(() => {
      console.log(`Timeout while waiting for session ID in output of aws cli command.`);
      resolve({ localPort, sessionId: 'error' })
    }, 15000)
    child.stdout.on('data', (data) => {
      data = data.toString() // Convert buffer to string
      process.stdout.write(data.blue);

      // Look for a sucessful start
      // "Starting session with SessionId: philip.callender-0d281b92d275af27a"
      // "Port 22372 opened for sessionId philip.callender-0b12c1afb02095da3."
      const match = /Port (\d+) opened for sessionId (.*)./.exec(data);
      // console.log(`match is `, match);
      if (match) {
        clearTimeout(timer)
        resolve({ localPort: match[1], sessionId: match[2] })
      }
    });

    // Handle stderr
    child.stderr.on('data', (data) => {
      data = data.toString() // Convert buffer to string
      // console.log(data.red);
      process.stdout.write(data.red);
      // Look for a connection error - "An error occurred (TargetNotConnected)..."
      if (data.indexOf('An error occurred (TargetNotConnected)') >= 0) {
        clearTimeout(timer)
        ssmWikiSuggestion()
        resolve({ localPort, sessionId: 'error' })
      }
    });
    child.on('close', (code) => {
      console.log(`Tunnel exited with code ${code}.`);
      // if ((Date.now() - startTime) < 5000) {
      //   ssmWikiSuggestion()
      // }
    });
  })
}// startTunnelForSSH

async function closeTunnel(options, sessionId) {
  // console.log(`closeTunnel()`);
  return new Promise((resolve, reject) => {

    var params = {
      SessionId: sessionId
    };
    myAWS.ssm().terminateSession(params, function(err, data) {
      if (err) {
        console.log(`terminateSession error:`);
        console.log(err, err.stack); // an error occurred
        reject(err)
      }
      else {
        // console.log(data);           // successful response
        resolve(null)
      }
    });
  })
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
      console.log(`Command exited with code ${code}.`);
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
    .option(`-s, --skip-ecs`, 'Skip ECS')

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
