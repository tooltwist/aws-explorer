module.exports = {
  id: (node, helpers) => {
    // return node.key
    return node.data.DBInstanceIdentifier
  },

  label: (node, {findTag}) => {
    return node.data.DBInstanceIdentifier
  },

  description: (node, helpers) => {
    if (node.data.Endpoint) {
      return `${node.data.Endpoint.Address}:${node.data.Endpoint.Port}`
    }
    return ``
  },

  describe: (node, {findTag}) => {
    // return ''
    let desc = ''
    desc += 'DATABASE ' + node.DBInstanceIdentifier
    // desc += 'From: ' + node.data.Protocol.toLowerCase() + ' / ' + node.data.Port + '\n'
    // desc += 'Healthcheck: ' + node.data.HealthCheckPath + '\n'

    // Add the targets for this target group, if they have been loaded
    // desc += describeTargets(node, withHealthchecks)
    return desc
  }
}
