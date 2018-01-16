const myAWS = require('./myAWS')
const download = require('./download')

var nodeIndex = [ ]; // key -> AWSNode

// AWS Node types
const SUBNET = 'Subnet'
const SECGRP = 'Security Group'
const VPC = 'Virtual Private Cloud'
const NAT = 'NAT Gateway'
const IGW = 'Internet Gateway'
const INSTANCE = 'EC2 Instance'
const JUMPBOX = 'Jumpbox' // EC2 Instance, with Tag Name = '*-jumpbox-*'
const IMAGE = 'AMI Image'
const AZ = 'Availability Zone'
const ADDR = 'Elastic IP'
const COSTCD = 'Cost Code'
const LOGICAL = 'Logical Grouping'
const PUBLICIP = 'Public IP Address'
const KEYPAIR = 'Key Pair'
const NETIFACE = 'Network Interface'
const ROUTETABLE = 'Route Table'
const ALB = 'Load Balancer'
const TARGETGRP = 'Target Group'
const LISTENER = 'Listener'
const RULE = 'Rule'
const CLUSTER = 'Cluster'
const SERVICE = 'Service'
const TASK = 'Task'



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
      case SUBNET:
        return vpcHome + '#subnets:filter=' + this.id
      case SECGRP:
        return ec2Home + '#SecurityGroups:groupId=' + this.id
      case VPC:
        return vpcHome + '#vpcs:filter=' + this.id
      case NAT:
        return vpcHome + '#NatGateways:search=' + this.id + ';sort=natGatewayId'
      case IGW:
        return vpcHome + '#igws:filter=' + this.id
      case INSTANCE:
        return ec2Home + '#Instances:search=' + this.id
      // case IMAGE = 'AMI Image'
      // case AZ = 'Availability Zone'
      case ADDR:
        return ec2Home + '#Addresses:search=' + this.id
      // case COSTCD = 'Cost Code'
      // case LOGICAL = 'Logical Grouping'
      // case PUBLICIP = 'Public IP Address'
      case KEYPAIR:
        return ec2Home + '#KeyPairs:search=' + this.id
      case NETIFACE:
        return ec2Home + '#NIC:networkInterfaceId=' + this.id
      case ROUTETABLE:
        return vpcHome + '#routetables:filter=' + this.id
      case ALB:
        return ec2Home + '#LoadBalancers:search=' + this.id
      case TARGETGRP:
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

function downloadRegion(region, withHealthchecks, callback) {
  console.log(`graph.downloadRegion(${region}, ${withHealthchecks})`);
  download.downloadEverything(region, withHealthchecks, callback);
}

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
module.exports.SUBNET = SUBNET;
module.exports.SECGRP = SECGRP;
module.exports.VPC = VPC;
module.exports.NAT = NAT;
module.exports.IGW = IGW;
module.exports.INSTANCE = INSTANCE;
module.exports.JUMPBOX = JUMPBOX;
module.exports.IMAGE = IMAGE;
module.exports.AZ = AZ;
module.exports.ADDR = ADDR;
module.exports.COSTCD = COSTCD;
module.exports.LOGICAL = LOGICAL;
module.exports.PUBLICIP = PUBLICIP;
module.exports.KEYPAIR = KEYPAIR;
module.exports.NETIFACE = NETIFACE;
module.exports.ROUTETABLE = ROUTETABLE;
module.exports.ALB = ALB;
module.exports.TARGETGRP = TARGETGRP;
module.exports.LISTENER = LISTENER;
module.exports.RULE = RULE;
module.exports.CLUSTER = CLUSTER;
module.exports.SERVICE = SERVICE;
module.exports.TASK = TASK;

// Functions
module.exports.downloadRegion = downloadRegion;
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
