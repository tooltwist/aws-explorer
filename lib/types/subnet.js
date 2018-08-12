module.exports.id = (node, helpers) => {
  return node.data.SubnetId
}

module.exports.label = (node, {findTag}) => {
  let name = findTag(node, 'Name')
  return name || node.data.SubnetId
}

module.exports.description = (node, helpers) => {
  return node.data.CidrBlock
}

module.exports.describe = (node, {findTag}) => {
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
