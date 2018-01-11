var myAWS = require('../server/misc/myAWS')

function ProvisionDatabase(callback) {
  console.log('You will need to add this database by hand.');
  console.log('');
  console.log(`    https://${myAWS.region()}.console.aws.amazon.com/rds/home?region=${myAWS.region()}#launch-dbinstance:ct=dbinstances`);
  console.log('');
  return callback(null)
}

module.exports.ProvisionDatabase = ProvisionDatabase;
