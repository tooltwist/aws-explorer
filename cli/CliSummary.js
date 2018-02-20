var StackInfo = require('../server/misc/StackInfo');
var myAWS = require('../server/misc/myAWS')

function CliSummary(callback) {
  console.log('ok 1');
  let stackInfo = StackInfo.stacksForRegion(myAWS.region());
  console.log('stackInfo is ', stackInfo);

  stackInfo.environments((err, environments) => {
    if (err) return callback(err);
    console.log('\nENVIRONMENTS:', environments);
    for (var envName in environments) {
      let e = environments[envName]
      console.log(`\nEnvironment ${envName}:`);
      for (var valueName in e.values) {
        let value = e.values[valueName];
        console.log(`        ${pad(valueName, 26)}  ${value}`)
      }
      for (var aname in e.apps) {
        let a = e.apps[aname];
        console.log(`  Application: ${aname}:`);
        for (var valueName2 in a.values) {
          let value = a.values[valueName2];
          console.log(`          ${pad(valueName2, 26)}  ${value}`)
        }
      }
    }
  })
}

module.exports = CliSummary
