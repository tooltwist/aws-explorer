var program = require('commander');
var myAWS = require('../server/misc/myAWS')
const awsRegions = require('aws-regions')

/*
 *  Search for where a compromised AWS_SECRET is being used.
 */
function CliCompromised(accessKey, callback) {
  let regions = [ ];
  if (program.region) {
    regions.push(program.region) // Command line
  } else {
    // All regions
    // console.log(awsRegions);
    awsRegions.list().forEach(r => {
      if (r.public) {
        regions.push(r.code);
      }
    })
  }

  (function nextRegion(cntRegion) {
    if (cntRegion >= regions.length) {
      process.exit(0)
    }
    let region = regions[cntRegion];
    console.log(`\nRegion ${region} (${myAWS.regionDescription(region)}):`);

    // Check the instances and launch configs in the region
    myAWS.checkAwsRegion(region)

    CliCompromised_checkInstances(accessKey, err => {
      if (err) return callback(err);
      CliCompromised_checkLauchConfigurations(accessKey, err => {
        if (err) return callback(err);
        nextRegion(cntRegion + 1)
      })
    });


  })(0); // Start iterating regions

}

// Look for instances
function CliCompromised_checkInstances(accessKey, callback) {
  myAWS.ec2().describeInstances({}, function(err, data) {
    if (err) return callback(err);

    (function nextRes(cntRes) {
      if (cntRes >= data.Reservations.length) {
        return callback(null)
      }
      let res = data.Reservations[cntRes];

      (function nextInstance(index) {
        if (index >= res.Instances.length) {
          return nextRes(cntRes + 1)
        }
        let instance = res.Instances[index]
        // console.log('instance=', instance);

        myAWS.ec2().describeInstanceAttribute({
          Attribute: "userData",
          InstanceId: instance.InstanceId
        }, function(err, userdata) {
          if (err) return callback(err);

          let state = instance.State.Name
          if (userdata.UserData.Value) {
            let str = new Buffer(userdata.UserData.Value, 'base64').toString('ascii');
            if (str.indexOf(accessKey) >= 0) {
              console.log(`  Instance ${instance.InstanceId} compromised  [${state}]`.red);
              // console.log('tags=', instance.Tags);
              instance.Tags.forEach(tag => {
                if (tag.Key == 'Name') {
                  console.log(`  ${tag.Value}`.grey);
                }
              })
            } else {
              console.log(`  Instance ${instance.InstanceId} ok`.green + `  [${state}]`);
            }
          } else {
            console.log(`  Instance ${instance.InstanceId} ok`.green + `  [${state}]`);
          }
          nextInstance(index + 1);
        }); //- describeInstanceAttribute
      })(0);//- nextInstance Start iterating instances
    })(0); // Start iterating reservations
  }); //- describeInstances()
}

// Look in launch configurations
function CliCompromised_checkLauchConfigurations(accessKey, callback) {
  myAWS.autoscaling().describeLaunchConfigurations({}, function(err, data) {
     if (err) return callback(err);
    //  console.log('as=', data);
     data.LaunchConfigurations.forEach(lc => {
      //  console.log('lc=', lc);

       // Check the launch configuration user data
       if (lc.UserData) {
         let str = new Buffer(lc.UserData, 'base64').toString('ascii');
         if (str.indexOf(accessKey) >= 0) {
           console.log(`  Launch configuration ${lc.LaunchConfigurationName} compromised`.red);
         } else {
           console.log(`  Launch configuration ${lc.LaunchConfigurationName} ok`.green);
         }
       } else {
         console.log(`  Launch configuration ${lc.LaunchConfigurationName} ok`.green);
       }
     })//- data.LaunchConfigurations
     return callback()
  });//- describeLaunchConfigurations
}//- checkLauchConfigurations()

module.exports = CliCompromised
