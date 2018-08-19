const provisionEnvironment = require('../provision/provision-environment'),
  inquirer = require('inquirer'),
  myAWS = require('../server/misc/myAWS'),
  mkdirp = require('mkdirp');
var fs = require('fs');

/* Prompt for the environment name */
function getApplicationName(details, callback/* (err) */) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'applicationName',
      message: 'Application name?',
      filter: (name) => {
        return name.toLowerCase();
      }
    }
  ]).then(function(answers) {
    details.applicationName = answers.applicationName;
    callback(null);
  })
}

function getHealthCheckPath(details, callback/* (err) */) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'healthCheckPath',
      message: 'Healthcheck path?'
    }
  ]).then(function(answers) {
    details.healthCheckPath = answers.healthCheckPath;
    callback(null);
  })
}

function getApplicationType(details, callback/* (err) */) {
  inquirer.prompt([
    {
      type: 'list',
      name: 'applicationType',
      message: 'Application type?',
      // choices: ['static', 'nodejs', 'golang', 'java - tooltwist', 'java - other']
      choices: ['static', 'nodejs', 'golang', 'java']
      // filter: (name) => { return name.toLowerCase(); }
    }
  ]).then(function(answers) {
    // console.log(JSON.stringify(answers, null, '  '));
    switch (answers.applicationType) {
      case 'java - tooltwist':
        details.applicationType = 'tooltwist';
        break;

      case 'java - other':
        details.applicationType = 'java';
        break;

      default:
        details.applicationType = answers.applicationType;

    }
    callback(null);
  })
}

// function installToS3(s3, source, destinationPath, recursive, callback) {
//   console.log(`installToS3(${source}, ${destinationPath}, ${recursive})`);
//   fs.readFile(source, { encoding: 'utf8' }, function (err, data) {
//     if (err) return callback(err);
//
//     console.log('data=' + typeof(data), data);
//
//      let file = "This is a file\n"
//     let file = data;
//     var params = {
//       Body: file,
//       Bucket: "nbt-j9-configs",
//       Key: destinationPath,
//        ServerSideEncryption: "AES256",
//        Tagging: "key1=value1&key2=value2"
//     };
//     s3.putObject(params, function(err, data) {
//       if (err) console.log(err, err.stack);  an error occurred
//       else     console.log("ok=", data);            successful response
//      /*
//      data = {
//       ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"",
//       ServerSideEncryption: "AES256",
//       VersionId: "Ri.vC6qVlA4dEnjgRV4ZHsHoFIjqEMNt"
//      }
//      */
//
//        return callback(null);
//     });
//   });
// }

// function initializeEnvironmentConfig(details, callback) {
//   console.log('initializeEnvironmentConfig()');
//
//   var s3 = new AWS.S3({
//     apiVersion: '2006-03-01',
//     region: currentRegion
//   });
//   let from = `${__dirname}/nbt-templates`;
//   let to = `${details.environmentName}`;
//
//   console.log('ok 1');
//   installToS3(s3, from+'/application-templates/Scripts/_empty', to+'/Scripts/_empty', false, err => {
//     if (err) return callback(err);
//     console.log('ok 2');
//     installToS3(s3, from+'/application-templates/Volumes/_empty', to+'/Volumes/_empty', false, err => {
//       if (err) return callback(err);
//       console.log('ok 3');
//       return callback(null);
//     })
//   });
// return;
//   let configTemplate = `${__dirname}/nbt-templates/service-static.cf`;
//
// }

/*
 *	Install a file
 */
function installFromTemplate(template, convertFn, to, callback) {
  // console.log(`installFromTemplate(${template})`);

  let from = `${__dirname}/../nbt-templates/${template}`
  fs.readFile(from, {
    encoding: 'utf8'
  }, (err, fileContents) => {
    if (err)
      return callback(err);
    if (convertFn) {
      fileContents = convertFn(fileContents)
    }
    fs.writeFile(to, fileContents,
    /* [, options] */
    err => {
      if (err)
        return callback(err)
      return callback(null)
    })
  })
}

function installApplicationScripts(configDir, callback) {
  console.log('installApplicationScripts()');

  let template = `application-templates/Scripts/db-cli`;
  installFromTemplate(template, null, `${configDir}/Scripts/db-cli`, (err) => {
    if (err)
      return callback(err);

    template = `application-templates/Scripts/db-init`;
    installFromTemplate(template, null, `${configDir}/Scripts/db-init`, (err) => {
      if (err)
        return callback(err);

      template = `application-templates/Scripts/db-load`;
      installFromTemplate(template, null, `${configDir}/Scripts/db-load`, (err) => {
        if (err)
          return callback(err);

        template = `application-templates/Scripts/db-dump`;
        installFromTemplate(template, null, `${configDir}/Scripts/db-dump`, (err) => {
          if (err)
            return callback(err);

          template = `application-templates/Scripts/redis-cli`;
          installFromTemplate(template, null, `${configDir}/Scripts/redis-cli`, (err) => {
            if (err)
              return callback(err);

            template = `application-templates/Scripts/healthcheck-1`;
            installFromTemplate(template, null, `${configDir}/Scripts/healthcheck-1`, (err) => {
              if (err)
                return callback(err);

              template = `application-templates/Scripts/healthcheck-4`;
              installFromTemplate(template, null, `${configDir}/Scripts/healthcheck-4`, (err) => {
                if (err)
                  return callback(err);

                template = `application-templates/Scripts/healthcheck-5`;
                installFromTemplate(template, null, `${configDir}/Scripts/healthcheck-5`, (err) => {
                  if (err)
                    return callback(err);

                  return callback(null)
                })
              })
            })
          })
        })
      })
    })
  })
}

function provisionApp_secureConfig(details, callback) {
  // console.log('provisionApp_secureConfig()');

  // Create the directory
  var home = require('os').homedir();
  let configDir = `${home}/SecureConfig/${details.environmentName}/${details.applicationName}`;
  // console.log('dir=' + configDir);
  mkdirp(`${configDir}/Deploy`, function(err) {
    if (err)
      console.error(err)
    mkdirp(`${configDir}/Scripts`, function(err) {
      if (err)
        console.error(err)
      mkdirp(`${configDir}/Config`, function(err) {
        if (err)
          console.error(err)

          // Function to replace variables in code templates
        const replaceVariables = (fileContents) => {
          let s = fileContents.replace(/{{{ENVIRONMENT}}}/g, details.environmentName)
          s = s.replace(/{{{APPLICATION}}}/g, details.applicationName);
          s = s.replace(/{{{REGION}}}/g, myAWS.region());
          return s;
        }

        // Install the deployment template used by CloudFormation in the 'Deploy' stage of our CodePipeline.
        let template = `application-templates/Deploy/service-${details.applicationType}.cf-ORIGINAL`
        installFromTemplate(template, replaceVariables, `${configDir}/Deploy/service.cf-ORIGINAL`, err => {
          // let deployScript = `${__dirname}/nbt-templates/application-templates/Deploy/service-${details.applicationType}.cf`;
          // fs.readFile(deployScript, { encoding: 'utf8' }, (err, fileContents) => {
          //   if (err) return callback(err);
          //   fs.writeFile(`${configDir}/Deploy/service.cf`, fileContents/*[, options]*/, err => {
          //     if (err) return callback(err);

          template = `application-templates/SETENV`
          installFromTemplate(template, replaceVariables, `${configDir}/SETENV`, err => {
            if (err)
              return callback(err);

            // Install 1.setenv
            template = `application-templates/0.init`
            installFromTemplate(template, replaceVariables, `${configDir}/0.init`, err => {
              if (err)
                return callback(err);

              // Install 1.setenv
              template = `application-templates/1.setenv`
              installFromTemplate(template, replaceVariables, `${configDir}/1.setenv`, err => {
                if (err)
                  return callback(err);

                // let from = `${__dirname}/nbt-templates/application-templates/1.setenv`;
                // fs.readFile(from, { encoding: 'utf8' }, (err, fileContents) => {
                //   if (err) return callback(err);
                //    fileContents = fileContents
                //      .replace(/{{{ENVIRONMENT}}}/g, details.environmentName)
                //      .replace(/{{{APPLICATION}}}/g, details.applicationName);
                //   fs.writeFile(`${configDir}/1.setenv`, fileContents, { encoding: 'utf8', mode: '0700' }, err => {
                //     if (err) return callback(err);

                // Install 2.prepare
                template = `application-templates/2.prepare`
                installFromTemplate(template, replaceVariables, `${configDir}/2.prepare`, (err) => {
                  // let from = `${__dirname}/nbt-templates/application-templates/2.prepare`;
                  // fs.readFile(from, { encoding: 'utf8' }, (err, fileContents) => {
                  //   if (err) return callback(err);
                  //    fileContents = fileContents
                  //      .replace(/{{{ENVIRONMENT}}}/g, details.environmentName)
                  //      .replace(/{{{APPLICATION}}}/g, details.applicationName);
                  //   fs.writeFile(`${configDir}/2.prepare`, fileContents, { encoding: 'utf8', mode: '0700' }, err => {
                  if (err)
                    return callback(err);

                  // Install 3.sync
                  template = `application-templates/3.sync`
                  installFromTemplate(template, replaceVariables, `${configDir}/3.sync`, (err) => {
                    // let from = `${__dirname}/nbt-templates/application-templates/3.sync`;
                    // fs.readFile(from, { encoding: 'utf8' }, (err, fileContents) => {
                    //   if (err) return callback(err);
                    //    fileContents = fileContents
                    //      .replace(/{{{ENVIRONMENT}}}/g, details.environmentName)
                    //      .replace(/{{{APPLICATION}}}/g, details.applicationName);
                    //   fs.writeFile(`${configDir}/3.sync`, fileContents, { encoding: 'utf8', mode: '0700' }, err => {
                    if (err)
                      return callback(err);

                    // Install README
                    template = `application-templates/README`;
                    installFromTemplate(template, replaceVariables, `${configDir}/README`, (err) => {
                      // let from = `${__dirname}/nbt-templates/application-templates/README`;
                      // fs.readFile(from, { encoding: 'utf8' }, (err, fileContents) => {
                      //   if (err) return callback(err);
                      //    fileContents = fileContents
                      //      .replace(/{{{ENVIRONMENT}}}/g, details.environmentName)
                      //      .replace(/{{{APPLICATION}}}/g, details.applicationName);
                      //   fs.writeFile(`${configDir}/README`, fileContents, err => {
                      if (err)
                        return callback(err);

                      // installEnvironmentScripts(configDir, (err) => {
                      // 	if (err) return callback(err);
                      // 	installApplicationScripts(configDir, (err) => {
                      // 		if (err) return callback(err);

                      installApplicationScripts(configDir, (err) => {
                        if (err)
                          return callback(err);

                        // Ask the user to update the S3 config
                        inquirer.prompt([
                          {
                            type: 'confirm',
                            name: 'step5complete',
                            message: `

    APPLICATION CONFIG FILES
    ------------------------
    A config skeleton has been written to ${configDir}

    Please go to this directory and:

      1. If you are installing this application in a different account to the one you
         usually use, your may need to define a profile in ~/.aws/credentials, and set
         an environment. For example:

              export AWS_PROFILE=production

      2. Place any required config files in the Configs and Scripts directories.

      3. Run the scripts in order (0.init, 1.setenv, etc) to upload these scripts to your
         newly created CodeCommit environment.

    Notes
    -----
    1. If you wish to substitute values into your config files, create a file named
    <filename>-ORIGINAL, and update 2.prepare to replace ___<variable>___ with a
    value from the SETENV file.

    Have you completed these steps?`
                          }
                        ]).then(function(answers) {
                          // Check their reply
                          if (answers.step5complete) {
                            callback(null);
                          } else {
                            console.log('Please complete these steps before continuing...');
                            return provisionApp_secureConfig(details, err => {
                              console.log(`

                                **************************************************************************************
                                ****                                                                              ****
                                ****    PLEASE BE VERY CAREFUL WITH THE FILES UNDER THE SecureConfig DIRECTORY    ****
                                ****                                                                              ****
                                ****    These files may contain sensitive configuration information, passwords    ****
                                ****    and credentials that can be used by hackers to compromise your account,   ****
                                ****    the database, or the application.                                         ****
                                ****                                                                              ****
                                ****    We strongly recommend you remove these files once your application is     ****
                                ****    operational, so the only copy of the files is in the AWS CodeCommit.      ****
                                **************************************************************************************

                                `);
                              return callback()
                            });
                          }
                        }); //- inquirer
                      }) // installApplicationScripts

                    }); //- read README
                  }); //- read 3.sync
                }); //- read 2.prepare
              }); //- read 1.setenv
            }); //- read 0.init
          }); //- read SETENV
        }); //- read service*.cf
      }); //- mkdirp /Config
    }); //- mkdirp /Scripts
  }); //- mkdirp /Deploy
}

function provisionApp_loadBalancer(details, callback) {
  let url = `https://${myAWS.region()}.console.aws.amazon.com/cloudformation/home?region=${myAWS.region()}#/stacks/create/review`;
  url += `?templateURL=https://s3-ap-northeast-1.amazonaws.com/nbt-templates/app-1-loadbalancer.cf`
  url += `&stackName=nbt-${details.environmentName}-${details.applicationName}-loadbalancer`;
  url += `&param_EnvironmentName=${details.environmentName}`;
  url += `&param_ApplicationName=${details.applicationName}`;
  url += `&param_HealthCheckPath=${details.healthCheckPath}`;
  url += `&param_CostCode=0000`;

  inquirer.prompt([
    {
      type: 'confirm',
      name: 'step2complete',
      message: `
\n
  LOAD BALANCER
  -------------
  Please run this stack, to prepare the load balancer:\n
\n
    ${url}\n
\n
  Have you completed this step?`
    }
  ]).then(function(answers) {
    // Check their reply
    if (answers.step2complete) {
      callback(null);
    } else {
      console.log('Please complete these steps before continuing...');
      return provisionApp_loadBalancer(details, callback);
    }
  })
}

function provisionApp_updateDNS(details, callback) {
  inquirer.prompt([
    {
      type: 'confirm',
      name: 'step3complete',
      message: `

  DNS ENTRY
  ---------
  If you wish, you can now create a DNS entry to access this application.  It takes a while
  for DNS entries to propagate around the world, so the sooner you do this the better:

    1. Look at the 'Outputs' section of the Cloudformaton stack you just completed.

    2. Take note of the 'ServiceUrl' endpoint.

    3. Wherever you maintain your DNS, add a CNAME record referring to this Url.

  Proceed?`
    }
  ]).then(function(answers) {
    // Check their reply
    if (answers.step3complete) {
      callback(null);
    } else {
      console.log('Please complete these steps before continuing...');
      return provisionApp_updateDNS(details, callback);
    }
  })
}

function provisionApp_codePipeline(details, callback) {

  let url = `https://${myAWS.region()}.console.aws.amazon.com/cloudformation/home?region=${myAWS.region()}#/stacks/create/review`;
  url += `?templateURL=https://s3-ap-northeast-1.amazonaws.com/nbt-templates/app-2-codepipeline.cf`
  url += `&stackName=nbt-${details.environmentName}-${details.applicationName}-codepipeline`;
  url += `&param_EnvironmentName=${details.environmentName}`;
  url += `&param_ApplicationName=${details.applicationName}`;
  url += `&param_GitHubBranch=${details.environmentName}`;

  inquirer.prompt([
    {
      type: 'confirm',
      name: 'step4complete',
      message: `
\n
  CODE PIPELINE
  -------------
  Please run this stack, to create the code Pipeline:
\n
    ${url}
\n
  NOTES:
\n
      You will need to include an access token for your Github account, which can be
      created under User Icon->Settings->Developer Settings->Personal Access Tokens.
      Please make sure to include 'repo' and 'admin:repo_hook' permissions.
\n
  Have you completed this step?`
    }
  ]).then(function(answers) {
    // Check their reply
    if (answers.step4complete) {
      callback(null);
    } else {
      console.log('Please complete this step before continuing...');
      return provisionApp_codePipeline(details, callback);
    }
  })
}

function ProvisionApplication(callback) {
  // console.log('ProvisionApplication');

  let details = {
    environmentName: null,
    applicationName: null
  };

  provisionEnvironment.getEnvironmentName(details, function(err) {
    if (err)
      return callback(err);

    getApplicationName(details, function(err) {
      if (err)
        return callback(err);

      getApplicationType(details, function(err) {
        if (err)
          return callback(err);

        getHealthCheckPath(details, err => {
          if (err)
            return callback(err);

          provisionApp_loadBalancer(details, err => {
            if (err)
              return callback(err);

            provisionApp_updateDNS(details, err => {
              if (err)
                return callback(err);

              provisionApp_codePipeline(details, err => {
                if (err)
                  return callback(err);

                provisionApp_secureConfig(details, function(err) {
                  if (err)
                    return callback(err);
                  let url1 = `https://${myAWS.region()}.console.aws.amazon.com/codepipeline/home?region=${myAWS.region()}#/dashboard`;
                  let url2 = `https://${myAWS.region()}.console.aws.amazon.com/ecs/home?region=${myAWS.region()}#/clusters/nbt-${details.environmentName}/services`;
                  let url3 = `https://${myAWS.region()}.console.aws.amazon.com/codecommit/home?region=${myAWS.region()}#/repository/nbt-${details.environmentName}-${details.applicationName}-SecureConfig`;

                  console.log();
                  console.log('Your application is now provisioned with codepipeline, an ECS service, and load balancer.\n');
                  console.log('Each time you commit to your Github repository, the deployment pipeline will be triggered.\n');
                  console.log();
                  console.log('Secure Repo : ' + url3);
                  console.log('CodePipeline: ' + url1);
                  console.log('ECS Cluster : ' + url2);

                  // https://ap-southeast-1.console.aws.amazon.com/ecs/home?region=ap-southeast-1#/clusters/nbt-trsgd1/services
                  return callback(null);
                });
              });
            });
          });
        });
      });
    });
  });
}

module.exports.ProvisionApplication = ProvisionApplication;
