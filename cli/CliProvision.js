const program = require('commander');
const myAWS = require('../server/misc/myAWS')
const capitalize = require('../server/misc/util').capitalize
const pad = require('../server/misc/util').pad
const inquirer = require('inquirer');

const provisionEnvironment = require('../provision/provision-environment')
const provisionApplication = require('../provision/provision-application')
const provisionDatabase = require('../provision/provision-database')
const provisionCache = require('../provision/provision-cache')

function CliProvision() {
  let region = program.region || myAWS.INITIAL_REGION;
  region = myAWS.checkAwsRegion(region);
  let regionName = capitalize(myAWS.regionDescription(region))
  console.log();
  console.log();
  console.log();
  console.log(`     **********************************************************`);
  console.log(`     ***                                                    ***`);
  console.log(`     ***   NOTE: Region is ${region} ${pad('('+regionName+')', 15)}   ***`);
  console.log(`     ***                                                    ***`);
  console.log(`     **********************************************************`);
  console.log();
  console.log();

  var questions = [
    {
      type: 'list',
      name: 'toCreate',
      message: 'What do you wish to create?',
      choices: [
        'Environment', 'Application', 'Database', 'Cache'
      ],
      // choices: ['Large', 'Medium', 'Small'],
      filter: function (val) {
        return val.toLowerCase();
      }
    },
  ];

  inquirer.prompt(questions).then((answers) => {
    // console.log('\nReplies:');
    // console.log(JSON.stringify(answers, null, '  '));

    switch (answers.toCreate) {
      case 'environment':
        provisionEnvironment.ProvisionEnvironment(err => {
          if (err) {
            console.log(err);
          }
        });
        break;

      case 'application':
        provisionApplication.ProvisionApplication(err => {
          if (err) {
            console.log(err);
          }
        });
        break;

      case 'database':
        provisionDatabase.ProvisionDatabase(err => {
          if (err) {
            console.log(err);
          }
        });
        break;

      case 'cache':
        provisionCache.ProvisionCache(err => {
          if (err) {
            console.log(err);
          }
        });
        break;
    }
  });
}

module.exports = CliProvision
