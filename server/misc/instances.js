
const myAWS = require('./myAWS')
const graph = require('./graph')
const download = require('./download')
const pad = require('./util').pad
const capitalize = require('./util').capitalize

function cliInstances (region) {
  region = myAWS.checkAwsRegion(region)

  // Clear existing list of nodes and reload everything
  graph.reset();
  download.downloadInstances(err => {
    if (err) {
      console.log('Error: ', err)
    }

    // Collect just the EC2 Instances
    let list = graph.nodes().filter(node => node.type === types.INSTANCE)

    // Patch on the name and other values
    list.forEach(node => {
      node._name = ''
      node._description = ''
      node._environment = ''
      node.data.Tags.forEach(tag => {
        if (tag.Key == 'Name') { node._name = tag.Value };
        if (tag.Key == 'Description') { node._description = tag.Value };
        if (tag.Key == 'Environment') { node._environment = tag.Value };
      })
    });

    // Sort the instance nodes
    list.sort((a, b) => {
      let env1 = a._environment
      let env2 = b._environment
      if (env1 < env2) {
        return -1
      } else if (env1 > env2) {
        return +1
      }
      let name1 = a._name
      let name2 = b._name
      if (name1 < name2) {
        return -1
      } else if (name1 > name2) {
        return +1
      }
      return 0
    })

    // Display the IP Addresses
    let regionDesc = capitalize(myAWS.regionDescription(region));
    console.log();
    console.log(`${regionDesc} (${region}):`);
    console.log();
    console.log(`   ${pad('ENVIRONMENT', 15)} ${pad('NAME', 25)} ${pad('STATE', 8)} ${pad('TYPE', 10)} ${pad('INSTANCE ID', 20)} ${pad('PUBLIC', 15)} ${pad('PRIVATE', 15)} ${pad('AVAIL. ZONE', 16)} ${pad('KEYNAME', 15)} ${'DESCRIPTION'}`);
    list.forEach(node => {
      // console.log(node.data);
      let instanceId = node.data.InstanceId;
      let state = node.data.State.Name;
      let type = node.data.InstanceType;
      let ipaddr = node.data.PublicIpAddress || ''
      let privateIp = node.data.PrivateIpAddress || ''
      let keyname = node.data.KeyName
      let az = node.data.Placement.AvailabilityZone
      let environment = node._environment
      let name = node._name
      let description = node._description

      console.log(`   ${pad(environment, 15)} ${pad(name, 25)} ${pad(state, 8)} ${pad(type, 10)} ${pad(instanceId, 20)} ${pad(ipaddr, 15)} ${pad(privateIp, 15)} ${pad(az, 16)} ${pad(keyname, 15)} ${description}`);
    })
  })
}


module.exports.cliInstances = cliInstances;
