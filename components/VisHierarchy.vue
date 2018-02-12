<template lang="pug">
  .page
    .container
      .columns
        .column.has-text-centered
          h3 Is-used-by

        .column.has-text-centered(style="min-width: 0;")
          h3 Current node

        .column.has-text-centered
          h3 Uses
    
    div#mynetwork
</template>

<script>
import vis from 'vis'

export default {
  name: 'VisHierarchy',
  props: [
    'node'
  ],
  methods: {
    init () {
      const theNodeIndex = this.node

      var nodes = []
      var edges = []
      var nextVisId = 0
      var nodeId = 0

      let p = new Promise((resolve, reject) => {
        let parents = theNodeIndex.parents
        if (parents) {
          parents.forEach((parent) => {
            nodes.push({ id: nextVisId, label: parent, group: nextVisId })
            edges.push({ from: nextVisId, to: parents.length, arrows: 'to' })
            nextVisId++
          })
        }
        nodeId = parents.length > 0 ? parents.length : 0
        resolve('success')
      })

      p.then((successMessage) => {
        nodes.push({ id: nextVisId++, label: theNodeIndex.key, group: nextVisId })
      })

      p.then((successMessage) => {
        let children = theNodeIndex.children
        if (children) {
          children.forEach((child) => {
            nodes.push({ id: nextVisId, label: child, group: nextVisId })
            edges.push({ from: nodeId, to: nextVisId, arrows: 'to' })
            nextVisId++
          })
        }
      })

      p.then((successMessage) => {
        console.log(nodes)
        console.log(edges)
        // // Get Vis to create the network
        nodes = new vis.DataSet(nodes)
        edges = new vis.DataSet(edges)

        // create a network
        var container = document.getElementById('mynetwork')
        var data = {
          nodes: nodes,
          edges: edges
        }
        var options = {
          layout: {
            hierarchical: {
              direction: 'LR',
              levelSeparation: 600,
              sortMethod: 'directed'
            }
          },
          nodes: {
            shape: 'box',
            size: 16
          },
          edges: {
            smooth: true
          }
        }
        var network = new vis.Network(container, data, options)

        // add event listeners
        network.on('select', function (params) {
          document.getElementById('selection').innerHTML = 'Selection: ' + params.nodes
        })
      })
    }
  },
  mounted () {
    this.init()
  }

}
</script>

<style scoped>
  #mynetwork {
    width: 100%;
    height: 600px;
    border: 1px solid lightgray;
  }
</style>
