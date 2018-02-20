var program = require('commander');
var myAWS = require('../server/misc/myAWS')


function CliInstallKey(ip) {
  let r = program.region || myAWS.INITIAL_REGION;
  let e = program.environment || '<your environment>Z'
  // let keyfile = `~/.ssh/nbt-${e}-${r}.pem`
  let cmd1 = `scp -i ~/.ssh/nbt-${e}-${r}.pem ~/.ssh/nbt-${e}-${r}.pem ec2-user@${ip}:/tmp`
  let cmd2 = `ssh -i ~/.ssh/nbt-${e}-${r}.pem ec2-user@${ip} '(mv /tmp/nbt-${e}-${r}.pem ~/.ssh; chmod 600 .ssh/nbt-${e}-${r}.pem; ls -la .ssh )'`
  console.log();
  console.log(cmd1);
  console.log(cmd2);
  console.log();
  if (!program.environment) {
    console.log();
    console.log('  Please note: to get the complete command, please include the option: -e <environment>');
    console.log();
  }
  process.exit(0)
}

module.exports = CliInstallKey
