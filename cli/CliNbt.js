// var program = require('commander');
var StackInfo = require('../server/misc/StackInfo');
var myAWS = require('../server/misc/myAWS')

function CliNbt(callback) {
  console.log('ok 1');
  let stackInfo = StackInfo.stacksForRegion(myAWS.region());
  console.log('stackInfo is ', stackInfo);

  stackInfo.stacks((err, stacks) => {
    if (err) return callback(err);

    console.log('ok 2');
    StackInfo.environmentCompletion(stacks, myAWS.region(), (err, environments, otherstacks) => {

      console.log('ok 3');
      // Now describe the environments
      console.log(`-------------------------------------`);
      environments.forEach(env => {
        console.log();
        console.log(`environment ${env.name}:`);
        console.log(`  have keypair: ${env.step1}`);
        console.log(`  have credentials: ${env.step2}`);
        console.log(`  provision network: ${env.step3 ? env.step3.StackStatus : '-'}`);
        console.log(`  provision jumpboxes: ${env.step4 ? env.step4.StackStatus : '-'}`);
        console.log(`  provision ECS cluster: ${env.step5 ? env.step5.StackStatus : '-'}`);
        console.log(`  applications:`);
        env.applist.forEach(app => {
          console.log(`    ${app.name}`);
          console.log(`        provision load balancer: ${app.step_loadBalancer ? app.step_loadBalancer.StackStatus : '-'}`);
          console.log(`        provision pipeline: ${app.step_pipeline ? app.step_pipeline.StackStatus : '-'}`);
        })
        console.log();
      });
    })
  })
}

module.exports = CliNbt
