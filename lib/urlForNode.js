const types = require('./types')

function urlForNode (node) {
  // console.log('urlForNode() lib')

  if (node.type === types.INSTANCE) {
    return '/instance/' + node.id
  }

  return '/node/' + node.key
}

module.exports = urlForNode
