/*
 *  Provision an NBT application.
 */
var inquirer = require('inquirer');
var myAWS = require('../server/misc/myAWS')


/*
 *  Prompt for the environment name
 */
function getEnvironmentName(details, callback/*(err)*/) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'environmentName',
      message: 'Environment name?',
      filter: (name) => { return name.toLowerCase(); }
    }
  ]).then(function (answers) {
    details.environmentName = answers.environmentName;
    callback(null);
  })
}

/*
 *  Prompt for the environment key pair
 */
function getKeyPair(details, callback/*(err)*/) {

  let url = `https://${myAWS.region()}.console.aws.amazon.com/ec2/v2/home?region=${myAWS.region()}#KeyPairs:sort=keyName`;

  inquirer.prompt([
    {
      type: 'confirm',
      name: 'haveKeypair',
      message: `
  Each environment requires a master Key Pair, used to access the servers.

  1. Go to the following URL:

      ${url}

  2. Create a key pair named:

      nbt-${details.environmentName}-${myAWS.region()}

  3. The keypair should be automatically downloaded to you machine, where you can install it:

      $ mv ~/Downloads/nbt-${details.environmentName}-${myAWS.region()}.pem ~/.ssh
      $ chmod 600 ~/.ssh/nbt-${details.environmentName}-${myAWS.region()}.pem

  4. On a Mac, also run:

      $ xattr -d com.apple.metadata:kMDItemWhereFroms ~/.ssh/nbt-${details.environmentName}-${myAWS.region()}.pem
      $ xattr -d com.apple.quarantine ~/.ssh/nbt-${details.environmentName}-${myAWS.region()}.pem

Have you completed these steps?`
    },
  ]).then(function(answers) {
    // Check their reply
    if (answers.haveKeypair) {
      callback(null);
    } else {
      console.log('Please complete these steps before continuing...');
      return getKeyPair(details, callback);
    }
  })
}


/*
 *  Prompt for the environment's credentials, to access the configs S3 bucket.
 */
function getCredentials(details, callback/*(err)*/) {
  let url = `https://console.aws.amazon.com/iam/home?region=${myAWS.region()}#/users`;

  inquirer.prompt([
    {
     type: 'input',
     name: 'clientKey',
     message: `
  We need the credentials for a new user, to access our Configs S3 bucket


  1. Go to the following URL:

      ${url}

  2. Create a new user:

      User name: nbt-s3config-${details.environmentName}
      Access type: Programmatic Access

  3. Press next, then select 'Attach existing policies directly'.
     Give them access to Policy 'AmazonS3ReadOnlyAccess' and proceed to
     review and then create the user.

  4. Write down the Access key ID and the Secret access key, and

          SAVE THESE DETAILS !!!

  5. Also enter the details here:

Access key ID?`,
   },
   {
     type: 'input',
     name: 'clientSecret',
     message: 'Secret access key?'
   },
  ]).then(function (answers) {
    // console.log('\nNew env:');
    // console.log(JSON.stringify(answers, null, '  '));
    details.clientKey = answers.clientKey;
    details.clientSecret = answers.clientSecret;
    callback(null);
  })
}


function getContactDetails(details, callback/*(err)*/) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'contactEmail',
      message: 'Contact email?',
      // filter: (name) => { return name.toLowerCase(); }
    }
  ]).then(function (answers) {
    // console.log('\nNew env:');
    // console.log(JSON.stringify(answers, null, '  '));
    details.contactEmail = answers.contactEmail;
    callback(null);
  })
}

function doEnvironmentProvisioning(details, callback) {

 // let url = `https://console.aws.amazon.com/iam/home?region=${myAWS.region()}#/users`;

  console.log('Please complete provisioning this environment by completing the following stacks:\n');

  let url = `https://${myAWS.region()}.console.aws.amazon.com/cloudformation/home?region=${myAWS.region()}#/stacks/create/review`;
  // url += `?templateURL=https://s3-${myAWS.region()}.amazonaws.com/cloudformation-templates-${myAWS.region()}/WordPress_Single_Instance.template`;
  url += `?templateURL=https://s3-ap-northeast-1.amazonaws.com/nbt-templates/1.network.cf`
  url += `&stackName=nbt-${details.environmentName}-1-network`;
  url += `&param_EnvironmentName=${details.environmentName}`;
  url += `&param_ContactEmail=${details.contactEmail}`;
  console.log('Stack #1 - set up the underlying infrastructure\n');
  console.log('\t' + url);
  console.log();

  // Jumpboxes
  url = `https://${myAWS.region()}.console.aws.amazon.com/cloudformation/home?region=${myAWS.region()}#/stacks/create/review`;
  // url += `?templateURL=https://s3-${myAWS.region()}.amazonaws.com/cloudformation-templates-${myAWS.region()}/WordPress_Single_Instance.template`;
  url += `?templateURL=https://s3-ap-northeast-1.amazonaws.com/nbt-templates/2.jumpboxes.cf`
  url += `&stackName=nbt-${details.environmentName}-2-jumpboxes`;
  url += `&param_EnvironmentName=${details.environmentName}`;
  console.log('Stack #2 - Create the jumpboxes for this environment\n');
  console.log('\t' + url);
  console.log();

  // Jumpboxes
  url = `https://${myAWS.region()}.console.aws.amazon.com/cloudformation/home?region=${myAWS.region()}#/stacks/create/review`;
  // url += `?templateURL=https://s3-${myAWS.region()}.amazonaws.com/cloudformation-templates-${myAWS.region()}/WordPress_Single_Instance.template`;
  url += `?templateURL=https://s3-ap-northeast-1.amazonaws.com/nbt-templates/3.ecs-cluster.cf`
  url += `&stackName=nbt-${details.environmentName}-3-ecs`;
  url += `&param_EnvironmentName=${details.environmentName}`;
  url += `&param_ClientKey=${details.clientKey}`
  url += `&param_ClientSecret=${details.clientSecret}`
  console.log('Stack #3 - set up the ECS Cluster\n');
  console.log(`(Don't forget to select 'I acknowledge that AWS Cloudformation might create AIM resources')\n`);
  console.log('\t' + url);
  console.log();
}


function ProvisionEnvironment(callback) {
  // console.log('ProvisionEnvironment');

  let details = {
    environmentName: null,
    clientId: null,
    clientSecret: null
  };
  //
  // initializeEnvironmentConfig(details, err => {
  //
  // })
  // return;

  getEnvironmentName(details, (err) => {
    if (err) return callback(err);

    getKeyPair(details, (err) => {
      if (err) return callback(err);

      getCredentials(details, (err) => {
        if (err) return callback(err);

        getContactDetails(details, (err) => {
          if (err) return callback(err);
        //   getEnvironmentName((err, name) => {
        //     if (err) return callback(err);
        //     getEnvironmentName((err, name) => {
        //       if (err) return callback(err);
        //       getEnvironmentName((err, name) => {
        //         if (err) return callback(err);
        //       })
        //     })
        //   })
          doEnvironmentProvisioning(details, (err) => {
            return callback(err);
          })
        })
      })
    })
  })

}

module.exports.ProvisionEnvironment = ProvisionEnvironment;
module.exports.getEnvironmentName = getEnvironmentName;
