var myAWS = require('../server/misc/myAWS')

function ProvisionCache(callback) {
  console.log('Add this Cache using the AWS ElastiCache console.');
  console.log('');
  console.log(`    https://${myAWS.region()}.console.aws.amazon.com/elasticache/home?region=${myAWS.region()}#redis:`);
  console.log('');
  return callback(null)
}

module.exports.ProvisionCache = ProvisionCache;
