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

module.exports.id = function (node) {
  if (!node.data) {
    return '-'
  }
  switch (node.type) {
    case this.SUBNET:
      return node.data.SubnetId

    case this.SECGRP:
      return node.data.GroupId

    case this.VPC:
      return node.data.VpcId

    case this.NAT:
      return node.data.NatGatewayId

    case this.IGW:
      return node.data.InternetGatewayId

    case this.INSTANCE:
      return node.data.InstanceId

    case this.IMAGE:
      return node.id

    case this.AZ:
      return node.id

    case this.ADDR:
      return node.data.AllocationId

    case this.COSTCD:
      return node.key

    case this.LOGICAL:
      return node.key

    case this.PUBLICIP:
      return node.id

    case this.KEYPAIR:
      return node.key

    case this.NETIFACE:
      return node.id

    case this.ROUTETABLE:
      return node.key + '\n--' + node.hasPublicRoutes

    case this.ALB:
      return node.id

    case this.TARGETGRP:
      return node.data.TargetGroupName

    case this.LISTENER:
      return node.key

    case this.RULE:
      return node.key

    case this.CLUSTER:
      return node.data.clusterName

    case this.SERVICE:
      return node.data.serviceName

    case this.TASK:
      return node.id

    case this.DATABASE:
      return node.key

    case this.CACHE:
      return node.key

    default:
      return node.key
  }
}

module.exports.label = function (node) {
  // let label
  let name
  switch (node.type) {
    case this.SUBNET:
      name = findTag(node, 'Name')
      return name || node.data.SubnetId

    case this.SECGRP:
      // if (node.data.GroupName === 'default') {
      //   // Default for the VPC
      //   return node.data.Description
      // }
      name = findTag(node, 'Name')
      return name || node.data.GroupName

    case this.VPC:
      name = findTag(node, 'Name')
      return name || node.key

    case this.NAT:
      name = findTag(node, 'Name')
      return name || node.data.NatGatewayId

    case this.IGW:
      return node.key

    case this.INSTANCE:
      name = findTag(node, 'Name')
      return name || node.key

    case this.IMAGE:
      return node.key

    case this.AZ:
      return node.id

    case this.ADDR:
      return `public: ${node.data.PublicIp}`

    case this.COSTCD:
      return node.key

    case this.LOGICAL:
      return node.key

    case this.PUBLICIP:
      return node.id

    case this.KEYPAIR:
      return node.key

    case this.NETIFACE:
      return `Private IP: ${node.data.PrivateIpAddress}`

    case this.ROUTETABLE:
      return node.key + '\n--' + node.hasPublicRoutes

    case this.ALB:
      return node.data.LoadBalancerName

    case this.TARGETGRP:
      return node.data.TargetGroupName

    case this.LISTENER:
      return node.key

    case this.RULE:
      return node.key

    case this.CLUSTER:
      return node.data.clusterName

    case this.SERVICE:
      return node.data.serviceName

    case this.TASK:
      if (node.data.containers && node.data.containers.length > 0) {
        return node.data.containers[0].name
      }
      return ' '

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
      return node.data.CidrBlock

    case this.SECGRP:
      return node.data.Description

    case this.VPC:
      return node.data.State

    case this.NAT:
      return `Public IP: ${node.data.NatGatewayAddresses[0].PublicIp}`

    case this.IGW:
      return node.key

    case this.INSTANCE:
      return ''

    case this.IMAGE:
      return node.key

    case this.AZ:
      return ' '

    case this.ADDR:
      return `private: ${node.data.PrivateIpAddress}`

    case this.COSTCD:
      return node.key

    case this.LOGICAL:
      return node.key

    case this.PUBLICIP:
      return ''

    case this.KEYPAIR:
      return node.key

    case this.NETIFACE:
      return ' '

    case this.ROUTETABLE:
      return node.key

    case this.ALB:
      return node.data.DNSName

    case this.TARGETGRP:
      return ' '

    case this.LISTENER:
      return node.key

    case this.RULE:
      return node.key

    case this.CLUSTER:
      return `${node.data.status.toLowerCase()}, ${node.data.registeredContainerInstancesCount} instances, ${node.data.runningTasksCount} tasks`

    case this.SERVICE:
      return `${node.data.status.toLowerCase()}, ${node.data.runningCount} running`

    case this.TASK:
      return `version ${node.data.version}, ${node.data.lastStatus.toLowerCase()}`

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
      return describeSubnet(node)

    case this.SECGRP:
      return describeSecurityGroup(node)

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
      return `<b>Public IP Address</b><br/>${node.id}`

    case this.KEYPAIR:
      return node.key

    case this.NETIFACE:
      return node.key

    case this.ROUTETABLE:
      return node.key

    case this.ALB:
      return node.key

    case this.TARGETGRP:
      return `
        <b>Target Group</b><br/>
        Name: ${node.data.TargetGroupName}<br>
        Healthcheck: ${node.data.HealthCheckPath}<br>
        Expected reply: ${node.data.Matcher.HttpCode}<br>`

    case this.LISTENER:
      return node.key

    case this.RULE:
      return node.key

    case this.CLUSTER:
      return node.key

    case this.SERVICE:
      return `
        <b>Service</b><br/>
        Name: ${node.data.serviceName}<br>
        Status: ${node.data.status}<br>
        Tasks: ${node.data.runningCount}<br>`

    case this.TASK:
      return describeTask(node)

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
  let s = '<b>Virtual Private Cloud (VPC)</b><br/>'
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

function describeSubnet (node) {
  // Return a description
  let desc = `Id: ${node.data.SubnetId}<br/>`

  // // See if the subnet's routing table connects to an Internet Gateway
  // let isPublicSubnet = false
  // node.parents.forEach(parent => {
  //   if (parent.type === module.exports.ROUTETABLE && parent.hasPublicRoutes) {
  //     isPublicSubnet = true
  //   }
  // })
  // if (isPublicSubnet) {
  //   desc += 'PUBLIC SUBNET<br/>'
  // } else {
  //   desc += 'PRIVATE SUBNET<br/>'
  // }

  let name = findTag(node, 'Name')
  if (name) {
    desc += `Name ${name}<br/>`
  }

  let description = findTag(node, 'Description')
  if (description) {
    desc += `Description: ${description}<br/>`
  }

  // Route table?
  let useVpcRouteTable = true
  node.parents.forEach(parent => {
    if (parent.type === this.ROUTETABLE) {
      useVpcRouteTable = false
    }
  })
  if (useVpcRouteTable) {
    desc += 'Use default route table for VPC<br/>'
  }
  // IP Address range
  desc += `CidrBlock: ${node.data.CidrBlock}<br/>`
  return desc
}

function describeSecurityGroup (node) {
  // Return a description
  let desc = `Security Group<br/>`
  desc += `Id: ${node.data.GroupId}<br/>`
  let name = findTag(node, 'Name')
  if (name) {
    desc += `Name Tag: ${name}<br/>`
  }
  desc += `Description: ${node.data.Description}<br/>`
  desc += `GroupName: ${node.data.GroupName}<br/>`

  // Route table?
  // let useVpcRouteTable = true
  // node.parents.forEach(parent => {
  //   if (parent.type === this.ROUTETABLE) {
  //     useVpcRouteTable = false
  //   }
  // })
  // if (useVpcRouteTable) {
  //   desc += 'Use default route table for VPC<br/>'
  // }
  // // IP Address range
  // desc += `CidrBlock: ${node.data.CidrBlock}<br/>`
  return desc
}

function describeTask (node) {
  let desc = `<b>Task</b><br/>`
  node.data.containers.forEach(c => {
    desc += `
      Name: ${c.name}<br>
      Ports: ${c.networkBindings.hostPort} -&gt; ${c.networkBindings.port}<br>`
  })
  desc += `
    Version: ${node.data.version}<br>
    Status: ${node.data.lastStatus}<br>
    Desired Status: ${node.data.desiredStatus}<br>
    Memory: ${node.data.memory}<br>
    CPU: ${node.data.cpu}<br>
  `
  return desc
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
