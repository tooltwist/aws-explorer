
const myAWS = require('../server/misc/myAWS')
const graph = require('../server/misc/graph')
const types = require('../lib/types')
const pad = require('../server/misc/util').pad
const capitalize = require('../server/misc/util').capitalize
const download = require('../server/misc/download')
const colors = require('colors')

function CliDatabases(region) {
  region = myAWS.checkAwsRegion(region)

  // Clear existing list of nodes and reload everything
  graph.reset();
  download.downloadDatabases(err => {
    if (err) {
      console.log('Error: ', err)
    }

    // Collect just the EC2 Instances
    let list = graph.nodes().filter(node => (node.type === types.DATABASE))

    // Patch on the name and other values
    list.forEach(node => {
      node._name = ''
      node._description = ''
      node._environment = ''
      // node.data.Tags.forEach(tag => {
      //   if (tag.Key == 'Name') { node._name = tag.Value };
      //   if (tag.Key == 'Description') { node._description = tag.Value };
      //   if (tag.Key == 'Environment') { node._environment = tag.Value };
      // })
    });

    // Sort the instance nodes

    // ZZZZZ
    list.sort((a, b) => {

      // Sort by name
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
    // let lines = '---------------------------------------'
    console.log();
    console.log(`${regionDesc} (${region}):`);
    console.log();
    console.log(`   ${pad('NAME', 20)} ${pad('STATE', 12)} ${pad('TYPE', 15)} ${pad('ENGINE', 10)} ${pad('PUBLIC', 6)}   ${pad('AVAIL. ZONE', 16)}  ${'DESCRIPTION'}`);
    console.log(`   ${pad('----', 20)} ${pad('-----', 12)} ${pad('----', 15)} ${pad('------', 10)} ${pad('------', 6)}   ${pad('-----------', 16)}  -----------`);
    let previousEnvironment = null;
    list.sort((n1, n2) => {
      let name1 = n1.data.DBInstanceIdentifier
      let name2 = n2.data.DBInstanceIdentifier
      if (name1 < name2) return -1
      if (name1 > name2) return +1
      return 0
    }).forEach(node => {
      // console.log(node.data);
      let name = node.data.DBInstanceIdentifier;
      let state = node.data.DBInstanceStatus;
      let engine = node.data.Engine;
      let type = node.data.DBInstanceClass;
      // let type = node.data.InstanceType;
      let az = node.data.AvailabilityZone
      let publicAccessible = node.data.PubliclyAccessible ? 'true' : 'false'
      let endpoint = node.data.Endpoint.Address + ':' + node.data.Endpoint.Port


      // let ipaddr = node.data.PublicIpAddress || ''
      // let privateIp = node.data.PrivateIpAddress || ''
      // let keyname = node.data.KeyName
      // let az = node.data.Placement.AvailabilityZone
      // let environment = node._environment
      // let name = node._name
      // let description = node._description

      // console.log(`Endpoint: `, node.data.Endpoint);
      // console.log(`DBSecurityGroups: `, node.data.DBSecurityGroups);
      // console.log(`VpcSecurityGroups: `, node.data.VpcSecurityGroups);
      // console.log(`DBSecurityGroups: `, node.data.DBSecurityGroups);
      // console.log(`DBSubnetGroup: `, node.data.DBSubnetGroup);

      let row = `   ${pad(name, 20)} ${pad(state, 12)} ${pad(type, 15)} ${pad(engine, 10)} ${pad(publicAccessible, 6)}   ${pad(az, 16)}  ${endpoint}`;
      if (state === 'available') {
        row = (publicAccessible === 'true') ? row.red.bold : row.green.bold;
      } else {
        row = (publicAccessible === 'true') ? row.red.dim : row.dim;
      }
      console.log(row);
    });
    console.log();
  })
}


module.exports = CliDatabases;
// module.exports.downloadInstances = downloadInstances;
