var program = require('commander');
const colors = require('colors')

function CliJump(ip1, ip2) {
  // console.log(`jumpbox ${ip1} ${ip2}`);
  let r = program.region || myAWS.INITIAL_REGION;
  let e = program.environment || 'some-environment'
  let keyfile = `~/.ssh/nbt-${e}-${r}.pem`
  let cmd = `ssh -q -t -i ${keyfile} ec2-user@${ip1} '(echo jumping...; ssh -q -t -i ${keyfile} ec2-user@${ip2})'     `.black.bold
  console.log();
  console.log('    ' + cmd);
  console.log();
  // let r = program.region || myAWS.INITIAL_REGION;
  // let e = program.environment || 'some-environment'

  console.log('Or, using SSH tunnelling:');
  let localPort = Math.floor(Math.random() * 30000) + 30000
  // let keyfile = `~/.ssh/nbt-${e}-${r}.pem`
  let cmd1 = `ssh -nNT -i ${keyfile} -L ${localPort}:${ip2}:22 ec2-user@${ip1}    `.black.bold
  let cmd2 = `ssh -q -t -p ${localPort} -i ${keyfile} ec2-user@127.0.0.1    `.black.bold

  console.log();
  console.log('    ' + cmd1);
  console.log();
  console.log('    ' + cmd2);
  console.log();
  console.log(`If you use tunnelling, be sure to terminate that first command as soon as you finish, as it poses a security weak point.`);
  console.log();

  if (!program.environment) {
    console.log();
    console.log('  Please note: to get the complete command, please include the option: -e <environment>');
    console.log();
  }
  process.exit(0)
}

module.exports = CliJump
