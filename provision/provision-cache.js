var myAWS = require('../server/misc/myAWS')

function ProvisionCache(callback) {
  console.log('You will need to add the cache by hand.');
  console.log('');
  console.log(`    https://${myAWS.region()}.console.aws.amazon.com/elasticache/home?region=${myAWS.region()}#redis:`);
  console.log('');
  return callback(null)
}

module.exports.ProvisionCache = ProvisionCache;
