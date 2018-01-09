
const myAWS = require('./myAWS')
const graph = require('./graph')
const pad = require('./util').pad
const capitalize = require('./util').capitalize

function downloadInstances(callback) {
  // console.log('  downloadInstances()');
  let describe = node => {
    let desc = ''
    let name = node.findTag('Name')
    if (name) {
      desc += '  Name: ' + name + '\n';
    }
    return desc
  }

  ec2.describeInstances({}, (err, data) => {
    if (err) return callback(err);
    // console.log('data=', data);
    data.Reservations.forEach(res => {
      res.Instances.forEach(instance => {
        // console.log('instance=', instance);
        let i = graph.findNode(graph.INSTANCE, instance.InstanceId, instance, describe)

        // ImageId
        let img = graph.findNode(graph.IMAGE, instance.ImageId, null)
        img.addChild(i)

        // Availability zone
        if (instance.Placement && instance.Placement.AvailabilityZone) {
          let az = graph.findNode(graph.AZ, instance.Placement.AvailabilityZone, null, node => {
            // Return a description
            let desc = 'Availability Zone (' + node.id + ')\n'
            return desc
          })
          az.addChild(i)
        }

        // Remember if it has a public IP
        if (instance.PublicIpAddress) {
          let ip = graph.findNode(graph.PUBLICIP, instance.PublicIpAddress)
          ip.addChild(i)
        }

        // Subnet
        //ZZZ Can an instance have multiple subnets?
        let sn = graph.findNode(graph.SUBNET, instance.SubnetId)
        sn.addChild(i)

        // VPC
        let vpc = graph.findNode(graph.VPC, instance.VpcId)
        vpc.addChild(i)

        // Security groups
        instance.SecurityGroups.forEach(sg => {
          let g = graph.findNode(graph.SECGRP, sg.GroupId)
          g.addChild(i)
          i.addChild(g)
        })
      })
    })
    return callback(null)
  })
}

function cliInstances(region) {
  region = myAWS.checkAwsRegion(region)

  // Clear existing list of nodes and reload everything
  graph.reset();
  downloadInstances(err => {
    if (err) {
      console.log('Error: ', err)
    }

    // Collect just the EC2 Instances
    let list = graph.nodes().filter(node => node.type === graph.INSTANCE)

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
module.exports.downloadInstances = downloadInstances;
