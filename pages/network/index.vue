<template lang="pug">
  .page
    .container.has-text-centered
      //img(src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo")
      h1.title Network
      h2.info
      hr
      br
    div#mynetwork
</template>

<script>
import NodeCard from '~/components/Card.vue'
import GraphClient from '~/lib/graphClient'

import vis from 'vis'
// import _ from 'lodash'

export default {
  name: 'id',
  components: {
    NodeCard
  },
  asyncData (context) {
    console.log('LOADING NODE ', context.params)

    return GraphClient(context.params.id, context.error)
  },
  mounted: function () {
    let _self = this
    let parents = this.index
    let parsedData = {}
    new Promise((resolve) => {
      Object.keys(parents).forEach(function (pkey) {
        let children = parents[pkey].children
        if (children) {
          Object.keys(children).forEach(function (key) {
            if (parsedData[parents[pkey].key]) {
              parsedData[parents[pkey].key] = { ...parsedData[parents[pkey].key], [children[key]]: {} }
            } else {
              parsedData[parents[pkey].key] = { [children[key]]: {} }
            }
          })
        }
      })
      resolve(parsedData)
    }).then((parsedData) => {
      let visdata = { nodes: [], edges: [], test: {} }
      new Promise((resolve) => {
        visdata.nodes.push({ id: 0, label: 'aws-explorer', group: 0 })
        let ctr = 1
        let parentCtr = 0
        // Object.keys(parents).forEach(function (key) {
        //   visdata.nodes.push({ id: ctr, label: parents[key] })
        //   visdata.edges.push({ from: key, to: 1 })
        //   ctr++
        // })
        Object.keys(parsedData).forEach(function (key) {
          if (key.indexOf('Subnet') === 0 || key.indexOf('Route') === 0 || key.indexOf('NAT') === 0 || key.indexOf('Network') === 0 || key.indexOf('Security') === 0) {
            return
          }

          let group = 0
          if (key.indexOf('Virtual') === 0) {
            group = 1
          } else if (key.indexOf('Availability') === 0) {
            group = 2
          } else if (key.indexOf('Subnets') === 0) {
            group = 3
          } else if (key.indexOf('Internet') === 0) {
            group = 4
          } else if (key.indexOf('Route') === 0) {
            group = 5
          } else if (key.indexOf('Elastic') === 0) {
            group = 6
          } else if (key.indexOf('Public') === 0) {
            group = 7
          } else if (key.indexOf('Instances') === 0) {
            group = 8
          } else if (key.indexOf('AMI') === 0) {
            group = 9
          } else if (key.indexOf('Key') === 0) {
            group = 10
          } else if (key.indexOf('Load') === 0) {
            group = 11
          } else if (key.indexOf('Target') === 0) {
            group = 12
          }

          visdata.nodes.push({ id: ctr, label: key, group: group })
          visdata.edges.push({ from: 0, to: ctr })
          parentCtr = ctr
          ctr++
          let children = Object.keys(parsedData[key]).length
          if (children) {
            Object.keys(parsedData[key]).forEach(function (key) {
              if (key.indexOf('Subnet') === 0 || key.indexOf('Route') === 0 || key.indexOf('NAT') === 0 || key.indexOf('Network') === 0 || key.indexOf('Security') === 0) {
                return
              }
              if (visdata.test.hasOwnProperty(key)) {
                // console.log(visdata.test[key])
                // visdata.nodes.push({ id: ctr, label: key })
                visdata.edges.push({ from: visdata.test[key], to: parentCtr })
              } else {
                visdata.test[key] = ctr
                visdata.nodes.push({ id: ctr, label: key, group: group })
                visdata.edges.push({ from: parentCtr, to: ctr })
              }
              ctr++
            })
          }
        })
        let nodes = new vis.DataSet(visdata.nodes)
        let edges = new vis.DataSet(visdata.edges)

        // console.log(nodes)

        // create a network
        var container = document.getElementById('mynetwork')
        var data = {
          nodes: nodes,
          edges: edges
        }
        var options = {
          interaction: { hover: true },
          nodes: {
            shape: 'dot',
            size: 16
          },
          physics: {
            forceAtlas2Based: {
              gravitationalConstant: -26,
              centralGravity: 0.005,
              springLength: 230,
              springConstant: 0.18
            },
            maxVelocity: 146,
            solver: 'forceAtlas2Based',
            timestep: 0.35,
            stabilization: {iterations: 150}
          }
        }
        var network = new vis.Network(container, data, options)

        network.on('click', function (params) {
          var ids = params.nodes
          var clickedNodes = nodes.get(ids)
          _self.$nuxt.$router.replace({ path: `/node/${clickedNodes[0].label}` })
        })

        network.on('hoverNode', function (params) {
          console.log('hoverNode Event:', params)
        })
      })
    })
  }
}
</script>

<style scoped>
.title
{
  margin-top: 30px;
}
.info
{
  font-weight: 300;
  color: #9aabb1;
  margin: 0;
  margin-top: 10px;
}
.button
{
  margin-top: 30px;
}
#mynetwork {
  width: 100%;
  height: 800px;
  border: 1px solid lightgray;
}
</style>
