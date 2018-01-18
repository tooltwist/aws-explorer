const types = require('./types')

function urlForNode (region, node) {
  // console.log('urlForNode() lib')

  if (node.type === types.INSTANCE) {
    return `/${region}/instance/${node.id}`
  }

  return `/${region}/node/${node.key}`
}

module.exports = urlForNode
