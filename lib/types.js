// AWS Node types
module.exports.SUBNET = 'Subnet'
module.exports.SECGRP = 'Security Group'
module.exports.VPC = 'Virtual Private Cloud'
module.exports.NAT = 'NAT Gateway'
module.exports.IGW = 'Internet Gateway'
module.exports.INSTANCE = 'EC2 Instance' // may have node.data._isJumpbox set
module.exports.IMAGE = 'AMI Image'
module.exports.AZ = 'Availability Zone'
module.exports.ADDR = 'Elastic IP'
module.exports.COSTCD = 'Cost Code'
module.exports.LOGICAL = 'Logical Grouping'
module.exports.PUBLICIP = 'Public IP Address'
module.exports.KEYPAIR = 'Key Pair'
module.exports.NETIFACE = 'Network Interface'
module.exports.ROUTETABLE = 'Route Table'
module.exports.ALB = 'Load Balancer'
module.exports.TARGETGRP = 'Target Group'
module.exports.LISTENER = 'Listener'
module.exports.RULE = 'Rule'
module.exports.CLUSTER = 'Cluster'
module.exports.SERVICE = 'Service'
module.exports.TASK = 'Task'
module.exports.DATABASE = 'Database'
module.exports.CACHE = 'Cache'

module.exports.label = function (node) {
  let label
  switch (node.type) {
    case this.SUBNET:
      return node.key

    case this.SECGRP:
      return node.key

    case this.VPC:
      label = findTag(node, 'Name')
      return label || node.key

    case this.NAT:
      return node.key

    case this.IGW:
      return node.key

    case this.INSTANCE:
      let name = findTag(node, 'Name')
      return name || node.key

    case this.IMAGE:
      return node.key

    case this.AZ:
      return node.key

    case this.ADDR:
      return node.key

    case this.COSTCD:
      return node.key

    case this.LOGICAL:
      return node.key

    case this.PUBLICIP:
      return node.key

    case this.KEYPAIR:
      return node.key

    case this.NETIFACE:
      return node.key

    case this.ROUTETABLE:
      return node.key

    case this.ALB:
      return node.key

    case this.TARGETGRP:
      return node.key

    case this.LISTENER:
      return node.key

    case this.RULE:
      return node.key

    case this.CLUSTER:
      return node.key

    case this.SERVICE:
      return node.key

    case this.TASK:
      return node.key

    case this.DATABASE:
      return node.key

    case this.CACHE:
      return node.key

    default:
      return node.key
  }
}

module.exports.description = function (node) {
  switch (node.type) {
    case this.SUBNET:
      return node.key

    case this.SECGRP:
      return node.key

    case this.VPC:
      return node.data.State

    case this.NAT:
      return node.key

    case this.IGW:
      return node.key

    case this.INSTANCE:
      return ''

    case this.IMAGE:
      return node.key

    case this.AZ:
      return node.key

    case this.ADDR:
      return node.key

    case this.COSTCD:
      return node.key

    case this.LOGICAL:
      return node.key

    case this.PUBLICIP:
      return node.key

    case this.KEYPAIR:
      return node.key

    case this.NETIFACE:
      return node.key

    case this.ROUTETABLE:
      return node.key

    case this.ALB:
      return node.key

    case this.TARGETGRP:
      return node.key

    case this.LISTENER:
      return node.key

    case this.RULE:
      return node.key

    case this.CLUSTER:
      return node.key

    case this.SERVICE:
      return node.key

    case this.TASK:
      return node.key

    case this.DATABASE:
      return node.key

    case this.CACHE:
      return node.key

    default:
      return `DESCRIPTION FOR ${node.key}`
  }
}

module.exports.describe = function (node) {
  switch (node.type) {
    case this.SUBNET:
      return node.key

    case this.SECGRP:
      return node.key

    case this.VPC:
      return describeVpc(node)

    case this.NAT:
      return node.key

    case this.IGW:
      return node.key

    case this.INSTANCE:
      return describeInstance(node)

    case this.IMAGE:
      return node.key

    case this.AZ:
      return node.key

    case this.ADDR:
      return node.key

    case this.COSTCD:
      return node.key

    case this.LOGICAL:
      return node.key

    case this.PUBLICIP:
      return node.key

    case this.KEYPAIR:
      return node.key

    case this.NETIFACE:
      return node.key

    case this.ROUTETABLE:
      return node.key

    case this.ALB:
      return node.key

    case this.TARGETGRP:
      return node.key

    case this.LISTENER:
      return node.key

    case this.RULE:
      return node.key

    case this.CLUSTER:
      return node.key

    case this.SERVICE:
      return node.key

    case this.TASK:
      return node.key

    case this.DATABASE:
      return node.key

    case this.CACHE:
      return node.key

    default:
      return node.key
  }
}

function describeInstance (node) {
  let desc = '<b>EC2 Instance</b><br/>'
  let name = findTag(node, 'Name')
  if (name) {
    desc += '  Name: ' + name + '<br>'
  }
  let description = findTag(node, 'Description')
  if (description) {
    desc += '  Description: ' + description + '<br>'
  }
  desc += `Type: ${node.data.InstanceType}<br>`
  desc += `Keyname: ${node.data.KeyName}<br>`
  desc += `State: ${node.data.State.Name}<br>`
  if (node.data.PublicIpAddress) {
    desc += '  IP addr: ' + node.data.PublicIpAddress + '<br>'
  }
  return desc
}

function describeVpc (node) {
  let s = '<b>EC2 Instance</b><br/>'
  let name = findTag(node, 'Name')
  if (name) {
    s += '  Name: ' + name + '<br>'
  }
  s += '  Id: ' + node.data.VpcId + '<br>'
  s += `State: ${node.data.State}<br>`
  let contact = findTag(node, 'Contact')
  if (contact) {
    s += '  Contact: ' + contact + '<br>'
  }
  return s
}

function findTag (node, tagname) {
  // Assumes node.data.Tags
  if (node.data && node.data.Tags) {
    for (var i = 0; i < node.data.Tags.length; i++) {
      let tag = node.data.Tags[i]
      if (tag.Key === tagname) {
        return tag.Value
      }
    }
  }
  return ''
}
module.exports.findTag = findTag
