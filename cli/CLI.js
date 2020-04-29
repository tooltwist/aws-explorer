var { program } = require('commander');
var myAWS = require('../server/misc/myAWS')

const CliInstallKey = require('./CliInstallKey')
const CliCompromised = require('./CliCompromised')
const CliJump = require('./CliJump')
const CliMysql = require('./CliMysql')
const CliRemotePrompted = require('./CliRemotePrompted')
const CliNbt = require('./CliNbt')
const CliSummary = require('./CliSummary')
const CliProvision = require('./CliProvision')
const CliDatabases = require('./CliDatabases')
// const CliCaches = require('./CliCaches')
const CliInstances = require('./CliInstances')
const CliClusters = require('./CliClusters')
const CliALBs = require('./CliALBs')
const StartWebServer = require('../bin/startWebServer')



function parseCommandLine(callback/*(unknownCommand, useDefault)*/) {

  /*
   *  Main thread starts here.
   */
  let haveCommand = false
  program
    .version('0.2.0')
    .option('-e, --environment <env>', 'Environment')
    .option('-p, --port <port>', 'Port for webserver', parseInt)
    .option('-r, --region <region> [' + myAWS.INITIAL_REGION + ']', 'Region')
    .option('-s, --skip-healthchecks', 'Skip healthchecks (faster loads, but no target group info)')

  // Start the website
  program
    .command('web')
    .description('Interactive website (this is the default)')
    .action(function(ip) {
      haveCommand = true
      StartWebServer() // Never returns
    });

  // Show EC2 instances
  program
    .command('instances')
    .description('List EC2 instances')
    .action(function(ip) {
      haveCommand = true
      let r = program.region || myAWS.INITIAL_REGION;
      CliInstances(r)
    });

  // Show ECS clusters
  program
    .command('clusters')
    .description('List ECS Clusters, Services and Tasks')
    .action(function(ip) {
      haveCommand = true
      let r = program.region || myAWS.INITIAL_REGION;
      CliClusters(r)
    });

  // Show Databases
  program
    .command('databases')
    .description('List databases')
    .action(function(ip) {
      haveCommand = true
      let r = program.region || myAWS.INITIAL_REGION;
      CliDatabases(r)
    });

  // Show load balancers
  program
    .command('albs')
    .description('List Application Load Balancers')
    .action(function(ip) {
      haveCommand = true
      let r = program.region || myAWS.INITIAL_REGION;
      CliALBs(r)
    });

    // Login to a server via a jump box
  program
    .command('jump <ipaddr1> <ipaddr2>')
    .description('Login to an EC2 instance via a jumpbox')
    .action(function(ip1, ip2) {
      haveCommand = true
      CliJump(ip1, ip2)
    });

  // Access database via a jump box
  program
    .command('mysql <jumpbox_ipaddr> <ecshost_ipaddr> <dbhost> <dbname> <username> <password>')
    .description('Connect to MySQL database')
    .action(function(ip1, ip2, dbhost, dbname, username, password) {
      haveCommand = true
      CliMysql(program.environment, ip1, ip2, dbhost, dbname, username, password)
    });

  // Access database via a jump box
  program
    .command('remote')
    .description('Easy connection through jumpboxes (to DB or ECS Host)')
    .action(function() {
      haveCommand = true
      CliRemotePrompted()
    });

  // Login to a server
  program
    .command('login <ipaddr>')
    .description('Login to an EC2 instance')
    .action(function(ip) {
      haveCommand = true
      let r = program.region || myAWS.INITIAL_REGION;
      let e = program.environment || 'some-environment'
      let keyfile = `~/.ssh/nbt-${e}-${r}.pem`
      let cmd = `ssh -q -t -i ${keyfile} ec2-user@${ip}`
      console.log();
      console.log(cmd);
      console.log();
      process.exit(0)
    });

  // Summary of environments
  program
    .command('regions')
    .action(function(ip) {
      haveCommand = true
      myAWS.regions();
      process.exit(0);
    });

  // Summary of environments
  program
    .command('summary')
    .action(function(ip) {
      haveCommand = true
      CliSummary(err => { if (err) console.log(err); })
    });

  // Summary of NBT stacks
  program
    .command('nbt')
    .action(function(ip) {
      haveCommand = true
      CliNbt(err => { if (err) console.log(err); })
    });

  // Install a key to a server
  program
    .command('installKey <ipaddr>')
    .action(function(ip) {
      haveCommand = true
      CliInstallKey(ip)
    });

  // Install a key to a server
  program
    .command('provision')
    .action(function(val1, val2, val3) {
      haveCommand = true
      // console.log('ea', val1, val2);
      // let r = Region.get('abc');
      // console.log('r.id:' + r.id);
      // r = Region.get('abc');
      // console.log('r.id:' + r.id);
  		CliProvision()
    });

  // Search for use of compromised AWS credentials
  // Looks in instance userdata and launch configurations.
  program
    .command('compromised <accessKey>')
    .description('Search for AWS credential usage')
    .action(function(accessKey) {
      haveCommand = true
      CliCompromised(accessKey, err => {
        if (err) console.log('CliCompromised: ', err);
      })
    });

  // Some incorrect command
  // program
  //   .command('*')
  //   .action(function(val1, val2, val3, val4, val5, val6) {
  //     console.log('default action');
  //     if (arguments.length == 0) {
  //       // Start the web server
  //       startWebServer()
  //     } else {
  //       program.help() // Exits
  //     }
  //   });


  // Parse the arguments
  program.parse(process.argv);

  console.log(`haveCommand=${haveCommand}`)

  if (!haveCommand) {
    // Have some unknown command
    return callback(true, false)
    // program.help() // Exits
  }


  // // See if anything got through the named arguments
  // if (program.parseOptions(process.argv).args.length <= 2) {
  //   // Use the default command
  //   return callback(false, true)
  //   // // Start the web server
  //   // startWebServer()
  // } else if (!haveCommand) {
  //   // Have some unknown command
  //   return callback(true, false)
  //   // program.help() // Exits
  // }
}

module.exports.parseCommandLine = parseCommandLine
