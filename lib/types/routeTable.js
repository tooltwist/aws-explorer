module.exports.id = (node, helpers) => {
  return ``
}

module.exports.label = (node, {findTag}) => {
  if (node.hasPublicRoutes) {
    return `${node.data.RouteTableId} (public)`
  }
  return `${node.data.RouteTableId} (private)`
}

module.exports.description = (node, helpers) => {
  return ``
}

module.exports.describe = (node, {findTag, types}) => {
  // Return a description
  let desc = ''
  if (node.hasPublicRoutes) {
    desc += '  --  HAS PUBLIC ROUTES'
  }
  let name = node.findTag('Name')
  if (name) {
    desc += '\n' + name
  }
  // See if this is a main route table
  // node.data.Associations.forEach(assoc => {
  //   if (assoc.Main) {
  //     desc += '\nMain Route table for ' + assoc.RouteTableAssociationId
  //   }
  // })

  // Routes
  desc += '\n<table class="smalltable">\n'
  node.data.Routes.forEach(route => {
    if (route.GatewayId === 'local') {
      desc += '<tr><td>' + route.DestinationCidrBlock + '</td><td>  >>>&nbsp;&nbsp;&nbsp;local</td></tr>\n'
    } else {
      let key = `${types.NAT}::${route.GatewayId}`
      desc += '<tr><td>' + route.DestinationCidrBlock + '</td><td>  >>>&nbsp;&nbsp;&nbsp;<a href="?node=' + key + '">' + route.GatewayId + '</a></td></tr>\n'
    }
  })
  desc += '</table>'
  return desc
}
