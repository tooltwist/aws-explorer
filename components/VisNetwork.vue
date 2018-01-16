<template lang="pug">
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
        input(type='checkbox', :checked="natGateways" v-on:click='onchange("natGateways")')
        |  NAT Gateways ({{natGateways}})
        br
      label.checkbox
        input(type='checkbox', :checked="networkInterfaces" v-on:click='onchange("networkInterfaces")')
        |  Network Interfaces ({{networkInterfaces}})
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
        input(type='checkbox', :checked="secgrp" v-on:click='onchange("secgrp")')
        |  Security Group ({{secgrp}})
        br
      label.checkbox
        input(type='checkbox', :checked="instances" v-on:click='onchange("instances")')
        |  Instances ({{instances}})
        br
      label.checkbox
        input(type='checkbox', :checked="jumpboxMode" v-on:click='onchange("jumpboxMode")')
        |  Jumpboxes ({{jumpboxMode}})
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
      label.checkbox
        input(type='checkbox', :checked="clusterMode" v-on:click='onchange("clusterMode")')
        |  Clusters ({{clusterMode}})
      label.checkbox
        input(type='checkbox', :checked="serviceMode" v-on:click='onchange("serviceMode")')
        |  Services ({{serviceMode}})
      label.checkbox
        input(type='checkbox', :checked="taskMode" v-on:click='onchange("taskMode")')
        |  Tasks ({{taskMode}})
    div
</template>

<script>
import vis from 'vis'
import _ from 'lodash'

export default {
  name: 'VisNetwork',
  data () {
    return {
      vpcs: false,
      availability: true,
      subnets: true,
      internet: false,
      route: false,
      natGateways: false,
      networkInterfaces: false,
      secgrp: false,
      elastic: false,
      public: false,
      instances: true,
      jumpboxMode: true,
      ami: false,
      key: false,
      load: true,
      target: false,
      clusterMode: false,
      serviceMode: false,
      taskMode: false
    }
  },
  components: {
  },
  props: [
    'index',
    'initialNodesFn', // Function to select initial nodes
    'rulesFn' // Function to determine what should be displayed
  ],
  methods: {
    init () {
      let _self = this
      let parentGrp = {
        'virtual_private_cloud': 'virtual_private_cloud',
        'availability_zone': 'availability_zone',
        'subnet': 'subnet',
        'internet_gateway': 'internet_gateway',
        'route_table': 'route_table',
        'nat_gateway::': 'nat_gateway',
        'network_interface': 'network_interface',
        'security_group': 'security_group',
        'elastic_ip': 'elastic_ip',
        'public_ip_address': 'public_ip_address',
        'ec2_instance': 'ec2_instance',
        'ami_image': 'ami_image',
        'key_pair': 'key_pair',
        'load_balancer': 'load_balancer',
        'target_group': 'target_group'
      }

      const version = 2
      if (version === 2) {
        const theNodeIndex = this.index

        /*
         *  The network nodes are found by recursively adding the children and
         *  parents of an initial set of nodes. The way this is done is controlled
         *  by user-provided functions:
         *
         *  initialNodesSelector(key) - bool
         *      This function is called with every node, so is given the chance
         *      to decide which nodes are used as the starting point for the
         *      recursive creating of the Vis network. For example, it can be
         *      used to restrict the starting point to a specific node, or
         *      specific types of nodes.
         *
         *  getRuleForNode(key) - 'hide', 'show' or 'expand'
         *      If 'hide' is returned the node will be completely ignored.
         *      If 'show' is returned the node will be shown, but we won't
         *      recurse to show it's parents or children.
         *      If 'expand' is returned we display the node and show the
         *      parents and children (subject to their own rule).
         *
         *      Typically 'expand' is used to show a node, but the 'show' rule
         *      is useful to prevent expanding into unrelated branches of the
         *      network.
         *
         *      For example, if we are looking at a specific EC2 instance, we
         *      may wish to see it's VPC on the Vis network, but we don't want
         *      that VPC to pull in the details of every other EC2 instance,
         *      just because they are in the same VPC.
         *
         *          if (key.startsWith('Virtual')) {
         *            return 'show'
         *          }
         *
         *  These functions may be provided by props to this component. If
         *  none are provided we'll use defaults that use all nodes as
         *  initialNodes, and selects nodes to display using a user interface.
         */
        let initialNodesSelector = null
        let getRuleForNode = null

        // Keep a list of vis 'nodes'
        var nodesForGraph = [ ] // [key] -> { key, visId }
        var nextVisId = 0
        let findVisId = (key, markAsLoaded, markAsInitialNode) => {
          var obj = nodesForGraph[key]
          if (!obj) {
            obj = { key: key, visId: nextVisId++, loaded: false, isInitialNode: false }
            nodesForGraph[key] = obj
          }
          let alreadyLoaded = obj.loaded
          if (markAsLoaded) {
            obj.loaded = true
          }
          if (markAsInitialNode) {
            obj.isInitialNode = true
          }
          return { id: obj.visId, alreadyLoaded }
        }

        // Keep a list of vis 'edges'
        var edgesForGraph = [ ] // [`${key1}:${key2}`] -> { key1, key2, visId1, visId2 } // key1 and key2 are in alphabetic order
        let registerEdge = (key1, key2) => {
          const compoundKey = (key1 < key2) ? `${key1}:${key2}` : `${key2}:${key1}`
          let definition = edgesForGraph[compoundKey]
          if (!definition) {
            let markAsLoaded = false
            let markAsInitialNode = false
            let visId1 = findVisId(key1, markAsLoaded, markAsInitialNode).id
            let visId2 = findVisId(key2, markAsLoaded, markAsInitialNode).id
            definition = { key1, key2, visId1, visId2 }
            edgesForGraph[compoundKey] = definition
          }
        }

        // Return a rule, based on the UI
        let getRuleForNodeFromUI = function (key) {
          let ignore = false
          if (
            (_self.vpcs === false && key.indexOf('Virtual') === 0) ||
            (_self.availability === false && key.indexOf('Availability') === 0) ||
            (_self.subnets === false && key.indexOf('Subnet') === 0) ||
            (_self.internet === false && key.indexOf('Internet') === 0) ||
            (_self.route === false && key.indexOf('Route Table') === 0) ||
            (_self.natGateways === false && key.indexOf('NAT Gateway::') === 0) ||
            (_self.networkInterfaces === false && key.indexOf('Network Interface') === 0) ||
            (_self.secgrp === false && key.indexOf('Security Group::') === 0) ||
            (_self.elastic === false && key.indexOf('Elastic') === 0) ||
            (_self.jumpboxMode === false && key.indexOf('Jumpbox') === 0) ||
            (_self.public === false && key.indexOf('Public') === 0) ||
            (_self.instances === false && key.indexOf('EC2') === 0) ||
            (_self.ami === false && key.indexOf('AMI') === 0) ||
            (_self.key === false && key.indexOf('Key') === 0) ||
            (_self.load === false && key.indexOf('Load') === 0) ||
            (_self.target === false && key.indexOf('Target') === 0) ||
            (_self.clusterMode === false && key.startsWith('Cluster::')) ||
            (_self.serviceMode === false && key.startsWith('Service::')) ||
            (_self.taskMode === false && key.startsWith('Task::'))
          ) {
            ignore = true
          }

          return ignore ? 'hide' : 'expand'
        }

        // If no 'rulesFn' prop was provided use our default,
        // that uses our UI selection to select node types
        if (this.rulesFn) {
          // Use the user-provided rules function
          getRuleForNode = this.rulesFn
        } else {
          // Use default rules, which come from the UI
          getRuleForNode = getRuleForNodeFromUI
        }

        // If no 'initialNodesFn' prop was provided, use our
        // default, that adds all nodes to the Vis network.
        let highlightInitialNodes = true
        if (this.initialNodesFn) {
          // Use the user-provided initial nodes selector
          initialNodesSelector = this.initialNodesFn
        } else {
          // Default initialNodesFn - all nodes added to the Vis graph
          highlightInitialNodes = false
          initialNodesSelector = function (key, index) {
            return true
          }
        }

        // Recursively add nodes to the graph
        let addNode = (key, markAsInitialNode) => {
          // console.log('key is ' + key)
          let rule = getRuleForNode(key)
          if (rule === 'hide') {
            return
          }

          //  If this is already loaded, don't do it again.
          //  (We don't want an infinite loop)
          let markAsLoaded = true
          let { alreadyLoaded } = findVisId(key, markAsLoaded, markAsInitialNode)
          if (alreadyLoaded) {
            return
          }

          // Add edges to the children
          let node = theNodeIndex[key]
          let children = node.children
          if (children && rule === 'expand') {
            children.forEach((childKey) => {
              let ruleForChild = getRuleForNode(childKey)
              if (ruleForChild !== 'hide') {
                registerEdge(key, childKey)
                addNode(childKey, false, false)
              }
            })
          }
          let parents = node.parents
          if (parents && rule === 'expand') {
            parents.forEach((parentKey) => {
              let ruleForParent = getRuleForNode(parentKey)
              if (ruleForParent !== 'hide') {
                registerEdge(parentKey, key)
                addNode(parentKey, false, false)
              }
            })
          }
        }

        // Here we go... add the initial nodes, and let it
        // add other nodes recuresively from there.
        Object.keys(this.index).forEach(function (key, cnt) {
          if (initialNodesSelector(key, cnt)) {
            // console.log('Adding initial node: ' + key)
            if (highlightInitialNodes) {
              addNode(key, true)
            } else {
              addNode(key, false)
            }
          }
        })

        // // List the nodes
        // Object.keys(nodesForGraph).forEach(function (key) {
        //   var def = nodesForGraph[key]
        //   console.log('-- node --> ' + key + ' --> ', def)
        // })
        // Object.keys(edgesForGraph).forEach(function (key) {
        //   var def = edgesForGraph[key]
        //   console.log('-- edge --> ' + key + ' --> ', def)
        // })

        // Convert our data to Vis definitions
        let visdata = { nodes: [], edges: [], container: {} }
        Object.keys(nodesForGraph).forEach(function (key) {
          var def = nodesForGraph[key]
          // console.log('-- node --> ' + key + ' --> ', def)

          // Decide on the node appearance (group) and it's label
          let group = 0
          let label = def.key
          if (def.isInitialNode) {
            // This node was one of those initially loaded.
            group = 999
            label = '>>>  ' + def.key + '  <<<'
          } else {
            // Choose the group based on the node type
            group = parentGrp[_.replace(_.split(key, '::')[0], /\s+/g, '_').toLowerCase()]
          }
          visdata.nodes.push({ id: def.visId, label: label, title: label, group: group })
        })
        Object.keys(edgesForGraph).forEach(function (key) {
          var def = edgesForGraph[key]
          // console.log('-- edge --> ' + key + ' --> ', def)
          visdata.edges.push({ from: def.visId1, to: def.visId2, arrows: 'to' })
        })

        // Get Vis to create the network
        let nodes = new vis.DataSet(visdata.nodes)
        let edges = new vis.DataSet(visdata.edges)

        // console.log(nodes)
        // console.log(edges)

        // create a network
        var container = document.getElementById('mynetwork')
        var data = {
          nodes: nodes,
          edges: edges
        }
        var options = {
          interaction: {
            hover: true
          },
          layout: { randomSeed: 2 },
          manipulation: {
            enabled: true
          },
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
          },
          groups: {
            999: {
              shape: 'triangle',
              color: '#FF9900' // orange
            }
            // availability: {
            //   shape: 'dot',
            //   color: '#2B7CE9' // blue
            // },
            // subnets: {
            //   shape: 'dot',
            //   color: '#5A1E5C' // purple
            // },
            // internet: {
            //   shape: 'square',
            //   color: '#C5000B' // red
            // },
            // routetable: {
            //   shape: 'square',
            //   color: '#109618' // green
            // }
          }
        }

        var network = new vis.Network(container, data, options)
        network.on('click', function (params) {
          var ids = params.nodes
          var clickedNodes = nodes.get(ids)
          if (clickedNodes[0].label) {
            _self.$nuxt.$router.replace({ path: `/node/${clickedNodes[0].label}` })
          }
        })
        network.on('hoverNode', function (params) {
          console.log('hoverNode Event:', params)
        })
        network.on('hoverEdge', function (params) {
          console.log('hoverEdge Event:', params)
        })

        return
      }

      // INITIAL VERSION
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
        let parentGrp = {
          'InitialNode': 99,
          'Virtual': 1,
          'Availability': 2,
          'Subnets': 3,
          'Internet': 4,
          'Route': 5,
          'Elastic': 6,
          'Public': 7,
          'EC2': 8,
          'AMI': 9,
          'Key': 10,
          'Load': 11,
          'Target': 12
        }
        let visdata = { nodes: [], edges: [], container: {} }
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

            let group
            Object.keys(parentGrp).forEach(function (groupKey) {
              if (key.indexOf(groupKey) === 0) {
                group = parentGrp[groupKey]
              }
            })

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
                if (visdata.container.hasOwnProperty(key)) {
                  // console.log(visdata.container[key])
                  // visdata.nodes.push({ id: ctr, label: key })
                  visdata.edges.push({ from: visdata.container[key], to: parentCtr })
                } else {
                  visdata.container[key] = ctr
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
      this.$set(this, _value, !this[_value])
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
.tooltip {
    position: relative;
    display: inline-block;
    border-bottom: 1px dotted black;
}

.tooltip .tooltiptext {
    visibility: hidden;
    width: 120px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;

    /* Position the tooltip */
    position: absolute;
    z-index: 1;
}

.tooltip:hover .tooltiptext {
    visibility: visible;
}
</style>
