module.exports = {
  id: (node) => {
    return node.id
  },

  label: (node, {findTag}) => {
    return ``
    // return node.data.LoadBalancerName
  },

  description: (node) => {
    return node.data.DNSName
  },

  describe: (node, {findTag, types}) => {
    let withHealthchecks = false
    // return node.key
    let desc = ''
    desc += 'Status: ' + node.data.State.Code + '\n'
    let dns = node.data.DNSName
    if (dns) {
      desc += 'dns: <a href="http://' + dns + '" target="_blank">' + dns + '</a>\n'
    }
    if (node._listeners) {
      node._listeners.forEach(listener => {
        let targetGroup = listener._targetGroupNode
        if (!targetGroup) {
          // No target group
          let link = listener.Protocol.toLowerCase() + '://' + dns + ':' + listener.Port
          desc += '<a href="' + link + '" target="_blank">Public ' + listener.Protocol.toLowerCase() + ' / ' + listener.Port + '</a> -> NO TARGET GROUP?\n'
        } else {
          // Have a target group
          // If we have the healthcheck information, we can also show the targets
          let link = listener.Protocol.toLowerCase() + '://' + dns + ':' + listener.Port + targetGroup.data.HealthCheckPath
          desc += '<a href="' + link + '" target="_blank">Public ' + listener.Protocol.toLowerCase() + ' / ' + listener.Port + '</a> -> Target Group (<a href="?node=' + targetGroup.key + '">' + targetGroup.id + '</a>)\n'

          // Add the targets for this target group, if they have been loaded
          desc += describeTargets(targetGroup, withHealthchecks, types)
        }
      })
    } else {
      desc += 'INTERNAL ERROR: MISSING _LISTENERS\n'
    }
    return desc
  }
}

function describeTargets (targetGroup, withHealthchecks, types) {
  let desc = ''
  if (withHealthchecks) {
    if (targetGroup._health && targetGroup._health.length > 0) {
      targetGroup._health.forEach(health => {
        // console.log('health=', health);
        let key = `${types.INSTANCE}::${health.Target.Id}`
        desc += '    -->> Instance '
        desc += '<a href="?node=' + key + '">' + health.Target.Id + '</a>'
        desc += ', port ' + health.Target.Port + '   (' + health.TargetHealth.State + ')\n'
      })
    } else {
      desc += '    No targets\n'
    }
  } else {
    desc += 'Unknown targets (--skip-healthchecks is set)\n'
  }
  return desc
}
