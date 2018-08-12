var program = require('commander');
const colors = require('colors')
const myAWS = require('../server/misc/myAWS')


function CliMysql(environment, ip1, ip2, dbhost, dbname, username, password) {
  // console.log(`jumpbox ${ip1} ${ip2}`);
  let r = program.region || myAWS.INITIAL_REGION;
  let e = environment || 'some-environment'
  let keyfile = `~/.ssh/nbt-${e}-${r}.pem`

  let localPort = Math.floor(Math.random() * 10000) + 30000
  let httpPort = localPort + 10000;
  let phpmyadminPort = 49494
  // let keyfile = `~/.ssh/nbt-${e}-${r}.pem`
  let tunnelCmd = `ssh -nNT -i ${keyfile} -L ${localPort}:${ip2}:22 ec2-user@${ip1} -L ${httpPort}:${ip2}:${phpmyadminPort} ec2-user@${ip1}      `
  let loginCmd = `ssh -t -i ${keyfile} -p ${localPort} ec2-user@127.0.0.1       `
  let mysqlCmd = `ssh -t -i ${keyfile} -p ${localPort} ec2-user@127.0.0.1 docker run -it --rm mysql mysql -h ${dbhost}  -u ${username} -p${password} ${dbname}       `
  let phpmyadminCmd = `ssh -t -i ${keyfile} -p ${localPort} ec2-user@127.0.0.1 docker run -it --rm -p ${phpmyadminPort}:80 -e PMA_HOST=${dbhost} phpmyadmin/phpmyadmin:4.6.4-1        `
  let browserCmd = `open http://localhost:${httpPort}        `

  console.log(`

                                    SSH Tunnelling Commands
                                    -----------------------`.bold);
  console.log(`
              The commands below will use an SSH tunnel to the ECS Host via the jumpbox.

                      localhost:${localPort} -> jumpbox (${ip1}) -> ${ip2}:22
                      localhost:${httpPort} -> jumpbox (${ip1}) -> ${ip2}:${phpmyadminPort}

              The first tunnel allows SSH access to the ECS host, while the second tunnel
              allows http access to PhpMyadmin. First, start the SSH tunnel:
    `);
  console.log(`${tunnelCmd}`.magenta.bold);
  console.log(`
              Terminate this command as soon as you finish (it's a security weak point)
  `);
  console.log(`
                                      Login
                                      -----
                                  `);
  console.log(`${loginCmd}
  `.blue.bold);
  console.log(`
                                      MySQL CLI
                                      ---------
                                  `);
  console.log(`${mysqlCmd}
  `.blue.bold);
  console.log(`
                                      Run PhpMyadmin
                                      --------------
                                `);
  console.log(`${phpmyadminCmd}

${browserCmd}
  `.blue.bold);
  console.log();

  if (!environment) {
    console.log();
    console.log('  Please note: to get the complete command, please include the option: -e <environment>');
    console.log();
  }
  process.exit(0)
}

module.exports = CliMysql
