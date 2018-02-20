const myAWS = require('./myAWS')
const types = require('../../lib/types')

var nodeIndex = [ ]; // key -> AWSNode


class AWSNode {

  constructor(type, id) {
    // console.log('AWSNode.constructor()');
    this.type = type
    this.id = id
    this.key = keyForNode(type, id)
    this.data = null
    this.children = [ ]
    this.parents = [ ]
    this.describeFn = null
  }

  setData(data) {
    this.data = data
  }

  setDescribe(fn) {
    // this.describeFn = fn
  }

  addChild(childNode) {
    if (childNode != null) {
      // console.log('WOOP ' + this.key + ' => ' + childNode.key)
      this.children.push(childNode.key)
      childNode.parents.push(this.key)
    }
  }

  findTag(tagname) {
    // Assumes this.data.Tags
    if (this.data && this.data.Tags) {
      for (var i = 0; i < this.data.Tags.length; i++) {
        let tag = this.data.Tags[i]
        if (tag.Key === tagname) {
          return tag.Value
        }
      }
    }
    return null
  }

  awsLink() {
    let ec2Home = 'https://' + myAWS.region() + '.console.aws.amazon.com/ec2/v2/home?region=' + myAWS.region()
    let vpcHome = 'https://' + myAWS.region() + '.console.aws.amazon.com/vpc/home?region=' + myAWS.region()
    switch (this.type) {
      case types.SUBNET:
        return vpcHome + '#subnets:filter=' + this.id
      case types.SECGRP:
        return ec2Home + '#SecurityGroups:groupId=' + this.id
      case types.VPC:
        return vpcHome + '#vpcs:filter=' + this.id
      case types.NAT:
        return vpcHome + '#NatGateways:search=' + this.id + ';sort=natGatewayId'
      case types.IGW:
        return vpcHome + '#igws:filter=' + this.id
      case types.INSTANCE:
        return ec2Home + '#Instances:search=' + this.id
      // case types.IMAGE = 'AMI Image'
      // case types.AZ = 'Availability Zone'
      case types.ADDR:
        return ec2Home + '#Addresses:search=' + this.id
      // case types.COSTCD = 'Cost Code'
      // case types.LOGICAL = 'Logical Grouping'
      // case types.PUBLICIP = 'Public IP Address'
      case types.KEYPAIR:
        return ec2Home + '#KeyPairs:search=' + this.id
      case types.NETIFACE:
        return ec2Home + '#NIC:networkInterfaceId=' + this.id
      case types.ROUTETABLE:
        return vpcHome + '#routetables:filter=' + this.id
      case types.ALB:
        return ec2Home + '#LoadBalancers:search=' + this.id
      case types.TARGETGRP:
        return ec2Home + '#TargetGroups:search=' + this.id
      default:
        return null
    }
  }

  dump() {
    if (this.describeFn) {
      let desc = this.describeFn(this)
      if (desc) {
        console.log(desc);
      }
    } else {
      console.log('Id: ' + this.id)
    }
    // console.log(' - children:', this.children)
    this.children.forEach(child => {
      // console.log('  ->', child)
      console.log('  - ' + child.id)
    })
  }

  findEnvironment() {
    let environment = null
    if (this.data && this.data.Tags) {
      this.data.Tags.forEach(tag => {
        if (tag.Key.toLowerCase() === 'environment') {
          environment = tag.Value;
          // console.log(`environment is [${environment}]`);
        }
      })
    }
    return environment;
  }

  label() {
    let label = null
    if (this.data) {
      if (this.data.Tags) {
        this.data.Tags.forEach(tag => {
          if (tag.Key.toLowerCase() === 'name') {
            label = tag.Value;
          }
        })
      }
      if (!label && this.data['Key']) {
        label = this.data['Key']
      }
    }
    if (!label) {
      label = this.id
    }
    return label
  }//- label()

}//- class AWSNode

function reset() {
  nodeIndex = [ ]
}

function keyForNode(type, id) {
  return type + '::' + id
}

function nodeWithKey(key) {
  let node = nodeIndex[key]
  return node
}

function findNode(type, id, data, describeFn) {
  // if (type === types.INSTANCE) {
  //   console.log(`****** INSTANCE ${id}, data=`, data);
  // }

  let key = keyForNode(type, id)
  let node = nodeIndex[key]
  if (!node) {
    node = new AWSNode(type, id)
    nodeIndex[key] = node
  }
  if (data) {
    node.setData(data)
  }
  if (describeFn) {
    console.log(`\n\nWARNING: findNode(${type}) called with describeFn`);
    node.setDescribe(describeFn)
  }
  return node
}

function dumpAll() {
  console.log('dumpAll');
  // console.log('nodeIndex=', nodeIndex);
  for (var key in nodeIndex) {
    console.log('')
    // console.log('key: ' + key);
    let node = nodeIndex[key]
    node.dump()
  }
}

function getIndex() {
  return nodeIndex;
}

function getKeys() {
  var keys = [ ];
  for (var key in nodeIndex) {
    keys.push(key);
  }
  return keys;
}

function getNodes() {
  var nodes = [ ];
  for (var key in nodeIndex) {
    let node = nodeIndex[key]
    nodes.push(node);
  }
  return nodes;
}

function nodesByType(type) {
  // console.log('nodesByType(' + type + ')');
  let arr = getNodes().filter(node => node.type === type);
  return sortAlphabetic(arr)
}

function sortAlphabetic(arr) {
  let sorted = arr.sort((a,b) => {

    // Sort by environment first
    let env1 = a.findEnvironment()
    if (!env1) env1 = 'zzzzzzzzzz';
    let env2 = b.findEnvironment()
    if (!env2) env2 = 'zzzzzzzzzz';
    if (env1 < env2) {
      return -1
    } else if (env1 > env2) {
      return 1
    }

    // Sort by name
    if (a.id < b.id) {
      return -1
    } else if (a.id > b.id) {
      return 1
    }
    return 0
  })
  return sorted
}

// function downloadRegion(region, withHealthchecks, callback) {
//   console.log(`graph.downloadRegion(${region}, ${withHealthchecks})`);
//   download.downloadEverything(region, withHealthchecks, callback);
// }

/*
 *  Return a list of environments
 */
function environments() {
  // Get unique environments
  var map = [ ];
  getNodes().forEach(node => {
    var environment = node.findEnvironment()
    if (environment) {
      map[environment] = environment
    }
  });
  // Create a list
  var list = [ ];
  for (var key in map) {
    list.push(key);
  }
  // Sort the list
  list.sort((a,b) => {
    if (a < b) {
      return -1
    } else if (a > b) {
      return +1
    } else {
      return 0
    }
  })
  return list;
}

// Constants
// module.exports.SUBNET = SUBNET;
// module.exports.SECGRP = types.SECGRP;
// module.exports.VPC = types.VPC;
// module.exports.NAT = types.NAT;
// module.exports.IGW = types.IGW;
// module.exports.INSTANCE = types.INSTANCE;
// module.exports.JUMPBOX = types.JUMPBOX;
// module.exports.IMAGE = types.IMAGE;
// module.exports.AZ = types.AZ;
// module.exports.ADDR = types.ADDR;
// module.exports.COSTCD = types.COSTCD;
// module.exports.LOGICAL = types.LOGICAL;
// module.exports.PUBLICIP = types.PUBLICIP;
// module.exports.KEYPAIR = types.KEYPAIR;
// module.exports.NETIFACE = types.NETIFACE;
// module.exports.ROUTETABLE = types.ROUTETABLE;
// module.exports.ALB = types.ALB;
// module.exports.TARGETGRP = types.TARGETGRP;
// module.exports.LISTENER = types.LISTENER;
// module.exports.RULE = types.RULE;
// module.exports.CLUSTER = types.CLUSTER;
// module.exports.SERVICE = types.SERVICE;
// module.exports.TASK = types.TASK;

// Functions
// module.exports.downloadRegion = downloadRegion;
module.exports.findNode = findNode;
module.exports.nodeWithKey = nodeWithKey;
module.exports.dumpAll = dumpAll;
module.exports.keyForNode = keyForNode;
module.exports.reset = reset;
module.exports.index = getIndex;
module.exports.keys = getKeys;
module.exports.nodes = getNodes;
module.exports.nodesByType = nodesByType;
module.exports.environments = environments;
