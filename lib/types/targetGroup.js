module.exports.id = (node, helpers) => {
  return node.data.TargetGroupName
}

module.exports.label = (node, {findTag}) => {
  return node.data.TargetGroupName
}

module.exports.description = (node, helpers) => {
  return ``
}

module.exports.describe = (node, {findTag}) => {
  return ''
  // return `
  //   <b>Target Group</b><br/>
  //   Name: ${node.data.TargetGroupName}<br>
  //   Healthcheck: ${node.data.HealthCheckPath}<br>
  //   Expected reply: ${node.data.Matcher.HttpCode}<br>`

  // let desc = ''
  // desc += 'From: ' + node.data.Protocol.toLowerCase() + ' / ' + node.data.Port + '\n'
  // desc += 'Healthcheck: ' + node.data.HealthCheckPath + '\n'
  //
  // // Add the targets for this target group, if they have been loaded
  // desc += describeTargets(node, withHealthchecks)
  // return desc
}
