<template lang="pug" track-by="$index">
  .columns
    .column.is-four-fifths
      div#mynetwork
    .column
      label.checkbox
        input(type='checkbox', :checked="vpcs" v-on:click='onchange("vpcs")')
        |  VPCs ({{vpcs}})
        br
      label.checkbox
        input(type='checkbox', :checked="availability" v-on:click='onchange("availability")')
        |  Availability Zones ({{availability}})
        br
      label.checkbox
        input(type='checkbox', :checked="subnets" v-on:click='onchange("subnets")')
        |  Subnets ({{subnets}})
        br
      label.checkbox
        input(type='checkbox', :checked="internet" v-on:click='onchange("internet")')
        |  Internet Gateway ({{internet}})
        br
      label.checkbox
        input(type='checkbox', :checked="route" v-on:click='onchange("route")')
        |  Route Tables ({{route}})
        br
      label.checkbox
        input(type='checkbox', :checked="elastic" v-on:click='onchange("elastic")')
        |  Elastic IPs ({{elastic}})
        br
      label.checkbox
        input(type='checkbox', :checked="public" v-on:click='onchange("public")')
        |  Public IP Addresses ({{public}})
        br
      label.checkbox
        input(type='checkbox', :checked="instances" v-on:click='onchange("instances")')
        |  Instances ({{instances}})
        br
      label.checkbox
        input(type='checkbox', :checked="ami" v-on:click='onchange("ami")')
        |  AMI Images ({{ami}})
        br
      label.checkbox
        input(type='checkbox', :checked="key" v-on:click='onchange("key")')
        |  Key Pairs ({{key}})
        br
      label.checkbox
        input(type='checkbox', :checked="load" v-on:click='onchange("load")')
        |  Load Balancers ({{load}})
        br
      label.checkbox
        input(type='checkbox', :checked="target" v-on:click='onchange("target")')
        |  Target Groups ({{target}})
    div
</template>

<script>
import vis from 'vis'

export default {
  name: 'VisNetwork',
  data () {
    return {
      vpcs: true,
      availability: true,
      subnets: true,
      internet: true,
      route: true,
      elastic: true,
      public: true,
      instances: true,
      ami: true,
      key: true,
      load: true,
      target: true
    }
  },
  components: {
  },
  props: [
    'index'
  ],
  methods: {
    init () {
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
            if ((_self.vpcs === false && key.indexOf('Virtual') === 0) || (_self.availability === false && key.indexOf('Availability') === 0) || (_self.subnets === false && key.indexOf('Subnets') === 0) || (_self.internet === false && key.indexOf('Internet') === 0) || (_self.routes === false && key.indexOf('Routes') === 0) || (_self.elastic === false && key.indexOf('Elastic') === 0) || (_self.public === false && key.indexOf('Public') === 0) || (_self.instances === false && key.indexOf('EC2') === 0) || (_self.ami === false && key.indexOf('AMI') === 0) || (_self.key === false && key.indexOf('Key') === 0) || (_self.load === false && key.indexOf('Load') === 0) || (_self.target === false && key.indexOf('Target') === 0)) {
              return
            }

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
            } else if (key.indexOf('EC2') === 0) {
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
                if ((_self.vpcs === false && key.indexOf('Virtual') === 0) || (_self.availability === false && key.indexOf('Availability') === 0) || (_self.subnets === false && key.indexOf('Subnets') === 0) || (_self.internet === false && key.indexOf('Internet') === 0) || (_self.routes === false && key.indexOf('Routes') === 0) || (_self.elastic === false && key.indexOf('Elastic') === 0) || (_self.public === false && key.indexOf('Public') === 0) || (_self.instances === false && key.indexOf('Instances') === 0) || (_self.key === false && key.indexOf('Key') === 0) || (_self.load === false && key.indexOf('Load') === 0) || (_self.target === false && key.indexOf('Target') === 0)) {
                  return
                }

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
    },
    onchange (_value) {
      if (this[_value]) {
        this.$set(this, _value, false)
      } else {
        this.$set(this, _value, true)
      }
    }
  },
  created () {
  },
  mounted () {
    this.init()
  },
  updated () {
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
