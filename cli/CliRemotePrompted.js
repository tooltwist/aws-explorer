const program = require('commander');
const myAWS = require('../server/misc/myAWS')
const graph = require('../server/misc/graph')
const capitalize = require('../server/misc/util').capitalize
const pad = require('../server/misc/util').pad
const download = require('../server/misc/download')
const types = require('../lib/types')
const inquirer = require('inquirer');

const CliMysql = require('./CliMysql')

function CliRemotePrompted() {
  let region = program.region || myAWS.INITIAL_REGION;
  region = myAWS.checkAwsRegion(region);
  let regionName = capitalize(myAWS.regionDescription(region))
  console.log();
  console.log();
  console.log();
  console.log(`**********************************************************`);
  console.log(`***                                                    ***`);
  console.log(`***   NOTE: Region is ${region} ${pad('('+regionName+')', 15)}   ***`);
  console.log(`***                                                    ***`);
  console.log(`**********************************************************`);
  console.log();
  if (!myAWS.INITIAL_REGION) {
    console.log(`Tip: You can specify region with the -r <region> option.`);
  }
  console.log();
  console.log();

  // Get a list of environments
  graph.reset();
  download.downloadInstances(err => {
    if (err) {
      console.log('Error: ', err)
    }
    download.downloadDatabases(err => {
      if (err) {
        console.log('Error: ', err)
      }

      // Collect just the EC2 Instances
      let list = graph.nodes().filter(node => (node.type === types.INSTANCE))

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
    })
  })
}

module.exports = CliRemotePrompted
