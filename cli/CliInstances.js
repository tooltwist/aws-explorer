
const myAWS = require('../server/misc/myAWS')
const graph = require('../server/misc/graph')
const types = require('../lib/types')
const pad = require('../server/misc/util').pad
const capitalize = require('../server/misc/util').capitalize
const download = require('../server/misc/download')
const colors = require('colors')

function CliInstances(region) {
  region = myAWS.checkAwsRegion(region)

  // Clear existing list of nodes and reload everything
  graph.reset();
  download.downloadInstances(err => {
    if (err) {
      console.log('Error: ', err)
    }

    // Collect just the EC2 Instances
    let list = graph.nodes().filter(node => (node.type === types.INSTANCE))

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
      node._isJumpbox = (node.data._isJumpbox) ? 1 : 0;
    });

    // Sort the instance nodes
    list.sort((a, b) => {

      // Group by environment
      let env1 = a._environment
      let env2 = b._environment
      if (env1 < env2) {
        return -1
      } else if (env1 > env2) {
        return +1
      }

      // Put jumboxes first
      let j1 = a._isJumpbox;
      let j2 = b._isJumpbox;
      if (j1 < j2) {
        return -1
      } else if (j1 > j2) {
        return +1
      }

      // Next by name
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
    console.log(`   ${pad('ENVIRONMENT', 15)} ${pad('NAME', 25)} ${pad('STATE', 8)} ${pad('TYPE', 10)} ${pad('INSTANCE ID', 20)} ${pad('PUBLIC', 15)} ${pad('PRIVATE', 15)} ${pad('AVAIL. ZONE', 16)} ${pad('KEYNAME', 28)} ${'DESCRIPTION'}`);
    console.log(`   ${pad('-----------', 15)} ${pad('----', 25)} ${pad('-----', 8)} ${pad('----', 10)} ${pad('-----------', 20)} ${pad('------', 15)} ${pad('-------', 15)} ${pad('-----------', 16)} ${pad('-------', 28)} ${'-----------'}`);
    let previousEnvironment = null;
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

      if (environment !== previousEnvironment) {
        console.log();
        previousEnvironment = environment;
      }

      let row = `   ${pad(environment, 15)} ${pad(name, 25)} ${pad(state, 8)} ${pad(type, 10)} ${pad(instanceId, 20)} ${pad(ipaddr, 15)} ${pad(privateIp, 15)} ${pad(az, 16)} ${pad(keyname, 28)} ${description}`;
      if (name.indexOf('-jumpbox-') > 0) {
        row = (state === 'running') ? row.blue : row.dim;
      } else {
        row = (state === 'running') ? row.green.bold : row.red;
      }
      console.log(row);
    });
    console.log();
  })
}


module.exports = CliInstances;
// module.exports.downloadInstances = downloadInstances;
