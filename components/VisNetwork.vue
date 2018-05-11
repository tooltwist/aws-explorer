<template lang="pug">
  .columns
    .column.is-four-fifths
      div#mynetwork
      .mypresets.columns
        .column(style='display: flex; align-items: center;')
          span Presets:
          button.button.is-small.is-primary(@click="presetClusters") Clusters
          button.button.is-small.is-primary(@click="presetNetworks") Networks
          button.button.is-small.is-primary(@click="presetInstances") Instances
          button.button.is-small.is-primary(@click="presetSecGrps") Security Groups
          button.button.is-small.is-primary(@click="presetVpcs") VPCs
          | &nbsp;&nbsp;&nbsp;&nbsp;
          button.button.is-small.is-primary(@click="presetAll") All
          button.button.is-small.is-primary(@click="presetNone") None
    .column.my-mode-selectors
      .columns
        .column
          |
        .column.sidebar-title
          .columns
            .column
              | Hide&nbsp;&nbsp;Show&nbsp;&nbsp;Expand
      .columns.sidebar-items
        .column
          | VPCs:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='vpcs')
      .columns.sidebar-items
        .column
          | Availability Zone:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='availabilityZones')
      .columns.sidebar-items
        .column
          | Subnets:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='subnets')
      .columns.sidebar-items
        .column
          | Internet Gateway:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='internet')
      .columns.sidebar-items
        .column
          | Route Tables:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='route')
      .columns.sidebar-items
        .column
          | NAT Gateways:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='natGateways')
      .columns.sidebar-items
        .column
          | Network Interfaces:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='networkInterfaces')
      .columns.sidebar-items
        .column
          | Elastic IPs:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='elastic')
      .columns.sidebar-items
        .column
          | Public IPs:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='public')
      .columns.sidebar-items
        .column
          | Security Group:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='secgrp')
      hr
      .columns.sidebar-items
        .column
          | Instances:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='instances')
      .columns.sidebar-items
        .column
          | Jumpboxes:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='jumpboxMode')
      .columns.sidebar-items
        .column
          | AMI Images:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='ami')
      .columns.sidebar-items
        .column
          | Key Pairs:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='key')
      hr
      .columns.sidebar-items
        .column
          | Load Balancers:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='load')
      .columns.sidebar-items
        .column
          | Target Groups:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='target')
      .columns.sidebar-items
        .column
          | Clusters:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='clusterMode')
      .columns.sidebar-items
        .column
          | Services:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='serviceMode')
      .columns.sidebar-items
        .column
          | Tasks:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='taskMode')
      hr
      .columns.sidebar-items
        .column
          | Databases:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='databaseMode')
      .columns.sidebar-items
        .column
          | Caches:
        .column
          input(class='slider is-fullwidth' step='1' min='0' max='2' type='range' v-model='cacheMode')

    div
</template>

<script>
import vis from 'vis'
import _ from 'lodash'
import types from '../lib/types'

export default {
  name: 'VisNetwork',
  data () {
    return {
      vpcs: 2,
      availabilityZones: 2,
      subnets: 2,
      internet: 0,
      route: 0,
      natGateways: 0,
      networkInterfaces: 0,
      elastic: 0,
      public: 0,
      secgrp: 0,
      instances: 2,
      jumpboxMode: 0,
      ami: 0,
      key: 0,
      load: 2,
      target: 2,
      clusterMode: 2,
      serviceMode: 2,
      taskMode: 2,
      databaseMode: 0,
      cacheMode: 0
    }
  },
  components: {
  },
  props: [
    'index',
    'initialNodesFn', // Function to select initial nodes
    'rulesFn', // Function to determine what should be displayed
    'settings' // An object containing initial settings for each node type
  ],
  methods: {
    init () {
      let _self = this
      let currentRegion = this.$store.state.region
      console.log('currentRegion = ', currentRegion)
      let parentGrp = {
        'virtual_private_cloud': 'virtual_private_cloud',
        // 'availability_zone': 'availability_zone',
        // 'subnet': 'subnet',
        'internet_gateway': 'internet_gateway',
        'route_table': 'route_table',
        'nat_gateway::': 'nat_gateway',
        'network_interface': 'network_interface',
        // 'security_group': 'security_group',
        'elastic_ip': 'elastic_ip',
        'public_ip_address': 'public_ip_address',
        // 'ec2_instance': 'ec2_instance',
        'ami_image': 'ami_image',
        'key_pair': 'key_pair',
        'load_balancer': 'load_balancer',
        'target_group': 'target_group'
      }

      // Use the default presets.
      // this.presetDefault()

      // Display the Vis network
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
          let option = 'hide'
          let rules = [{ id: 0, rule: 'hide' }, { id: 1, rule: 'show' }, { id: 2, rule: 'expand' }]
          rules.forEach(function (rule) {
            if (
              (parseInt(_self.vpcs) === rule.id && key.indexOf('Virtual') === 0) ||
              (parseInt(_self.availabilityZones) === rule.id && key.indexOf('Availability') === 0) ||
              (parseInt(_self.subnets) === rule.id && key.indexOf('Subnet') === 0) ||
              (parseInt(_self.internet) === rule.id && key.indexOf('Internet') === 0) ||
              (parseInt(_self.route) === rule.id && key.indexOf('Route Table') === 0) ||
              (parseInt(_self.natGateways) === rule.id && key.indexOf('NAT Gateway::') === 0) ||
              (parseInt(_self.networkInterfaces) === rule.id && key.indexOf('Network Interface') === 0) ||
              (parseInt(_self.secgrp) === rule.id && key.indexOf('Security Group::') === 0) ||
              (parseInt(_self.elastic) === rule.id && key.indexOf('Elastic') === 0) ||
              (parseInt(_self.jumpboxMode) === rule.id && key.indexOf('Jumpbox') === 0) ||
              (parseInt(_self.public) === rule.id && key.indexOf('Public') === 0) ||
              (parseInt(_self.instances) === rule.id && key.indexOf('EC2') === 0) ||
              (parseInt(_self.ami) === rule.id && key.indexOf('AMI') === 0) ||
              (parseInt(_self.key) === rule.id && key.indexOf('Key') === 0) ||
              (parseInt(_self.load) === rule.id && key.indexOf('Load') === 0) ||
              (parseInt(_self.target) === rule.id && key.indexOf('Target') === 0) ||
              (parseInt(_self.clusterMode) === rule.id && key.startsWith('Cluster::')) ||
              (parseInt(_self.serviceMode) === rule.id && key.startsWith('Service::')) ||
              (parseInt(_self.taskMode) === rule.id && key.startsWith('Task::')) ||
              (parseInt(_self.databaseMode) === rule.id && key.startsWith('Database::')) ||
              (parseInt(_self.cacheMode) === rule.id && key.startsWith('Cache::'))
            ) {
              option = rule.rule
            }
          })
          return option
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
          // console.log(rule)
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
                addNode(childKey, false)
              }
            })
          }
          let parents = node.parents
          if (parents && rule === 'expand') {
            parents.forEach((parentKey) => {
              let ruleForParent = getRuleForNode(parentKey)
              if (ruleForParent !== 'hide') {
                registerEdge(parentKey, key)
                addNode(parentKey, false)
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
          console.log('-- node --> ' + key + ' --> ', def)

          // Get the actual node definition.
          let node = theNodeIndex[key]

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

          // See http://visjs.org/docs/network/nodes.html
          let nodedef = { id: def.visId, label: label, title: label, group: group, shape: 'square', ourKey: def.key }
          if (node.type === types.INSTANCE) {
            // let label = types.findTag(node, 'Name')
            // if (!label) {
            //   if (node.data) {
            //     console.log('node is', node)
            //     label = node.data.InstanceId
            //   } else {
            //     label = `Unknown ${node.id}`
            //   }
            // }
            // nodedef.label = `EC2 Instance\n${label}`
            // nodedef.title = `<b>EC2 Instance</b><br/>
            //     Id: ${node.data.InstanceId}<br/>
            //     Type: ${node.data.InstanceType}`
            nodedef.label = `EC2 Instance\n${types.label(node)}`
            nodedef.title = types.describe(node)
            nodedef.shape = 'image'
            nodedef.image = '/aws-images/Compute_AmazonEC2_instance.png'
          } else if (node.type === types.VPC) {
            nodedef.label = types.label(node)
            nodedef.title = types.describe(node)
            nodedef.shape = 'image'
            nodedef.image = '/aws-images/General_virtualprivatecloud.png'
          } else if (node.type === 'Database') {
            nodedef.shape = 'image'
            nodedef.image = '/aws-images/Database_AmazonRDS_DBinstance.png'
          } else if (node.type === types.ROUTETABLE) {
            nodedef.label = types.label(node)
            nodedef.title = `<b>Route Table</b><br />${types.describe(node)}`
            nodedef.shape = 'image'
            nodedef.image = '/aws-images/Compute_AmazonVPC_router.png'
          } else if (node.type === types.IGW) {
            nodedef.shape = 'image'
            nodedef.image = '/aws-images/Compute_AmazonVPC_Internetgateway.png'
          } else if (node.type === types.ALB) {
            nodedef.label = `Load Balancer\n${node.data.LoadBalancerName}`
            nodedef.title = `<b>Load Balancer</b><br/>${node.data.LoadBalancerName}<br/>${node.data.DNSName}`
            nodedef.shape = 'image'
            nodedef.image = '/aws-images/Compute_ElasticLoadBalancing_ApplicationLoadBalancer.png'
          } else if (node.type === types.CLUSTER) {
            nodedef.label = `Cluster\n${node.data.clusterName}`
            nodedef.title = `<b>Cluster</b><br/>${node.data.clusterName}<br/>status: ${node.data.status}<br/>containers: ${node.data.registeredContainerInstancesCount}<br/>tasks: ${node.data.runningTasksCount}<br/><i>Note: this information might be out of date.</i>`
            nodedef.shape = 'image'
            nodedef.image = '/aws-images/Compute_AmazonEC2.png'
          } else if (node.type === types.SERVICE) {
            nodedef.label = `Service\n${types.label(node)}`
            nodedef.title = types.describe(node)
            nodedef.shape = 'image'
            nodedef.image = '/aws-images/Compute_AmazonECR_ECRRegistry.png'
          } else if (node.type === types.TASK) {
            nodedef.label = `Task\n${types.label(node)}`
            nodedef.title = types.describe(node)
            nodedef.shape = 'image'
            nodedef.image = '/aws-images/Compute_AmazonECS_ECScontainer.png'
          } else if (node.type === types.TARGETGRP) {
            nodedef.label = `Target Group\n${types.label(node)}`
            nodedef.title = types.describe(node)
            nodedef.shape = 'image'
            nodedef.image = '/aws-images/Compute_AmazonECS.png'
          } else if (node.type === types.NAT) {
            nodedef.shape = 'image'
            nodedef.image = '/aws-images/Compute_AmazonVPC_VPCNATgateway.png'
          } else if (node.type === types.ADDR) {
            nodedef.label = `Elastic\n${node.data.PublicIp}`
            nodedef.shape = 'image'
            nodedef.image = '/aws-images/Compute_AmazonEC2_ElasticIPaddress.png'
          } else if (node.type === types.SECGRP) {
            nodedef.label = `Security Group\n${types.label(node)}`
            nodedef.title = types.describe(node)
            nodedef.shape = 'image'
            // nodedef.image = '/aws-images/Compute_AmazonEC2_ElasticIPaddress.png'
            nodedef.shape = 'dot'
            nodedef.color = { border: '#c7c7c7', background: '#eee' }
          } else if (node.type === types.SUBNET) {
            // nodedef.label = `${node.data.SubnetId}\n${types.findTag(node, 'Name')}`
            nodedef.label = types.label(node)
            nodedef.title = `<b>Subnet</b><br />${types.describe(node)}`
            nodedef.shape = 'dot'
            nodedef.color = { border: '#c7c7c7', background: '#eee' }
          } else if (node.type === types.AZ) {
            nodedef.label = `Availability Zone\n${node.data.ZoneName}`
            nodedef.shape = 'dot'
            nodedef.color = { border: '#c7c7f7', background: '#eef' }
          } else if (node.type === 'Public IP Address') {
            nodedef.shape = 'triangle'
            nodedef.color = { border: '#c7c7f7', background: '#eef' }
          }

          visdata.nodes.push(nodedef)
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
            enabled: false
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
            // availabilityZones: {
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
          var options = {
            scale: 1.0,
            offset: {x: 0, y: 0},
            animation: {
              duration: 1000,
              easingFunction: 'easeInOutQuad'
            }
          }
          network.focus(clickedNodes[0].id, options)
        })
        network.on('doubleClick', function (params) {
          var ids = params.nodes
          var clickedNodes = nodes.get(ids)
          if (clickedNodes[0].label) {
            _self.$nuxt.$router.replace({ path: `/${currentRegion}/node/${clickedNodes[0].ourKey}` })
          }
        })
        network.on('hoverNode', function (params) {
          console.log('hoverNode Event:', params)
        })
        network.on('hoverEdge', function (params) {
          console.log('hoverEdge Event:', params)
        })
      }
    },
    onchange (_id, _value) {
      console.log(_id, _value)
      this.$set(this, _id, _value)
    },
    usePresets (presets) {
      function mode (name) {
        let val = presets[name]
        if (!val) {
          return 0
        }
        if (val === 'expand') {
          return 2
        }
        if (val === 'show') {
          return 1
        }
        return 0
      }
      this.vpcs = mode('vpc')
      this.availabilityZones = mode('availabilityZones')
      this.subnets = mode('subnets')
      this.internet = mode('internet')
      this.route = mode('route')
      this.natGateways = mode('natGateways')
      this.networkInterfaces = mode('networkInterfaces')
      this.secgrp = mode('secgrp')
      this.elastic = mode('elastic')
      this.public = mode('public')
      this.instances = mode('instances')
      this.jumpboxMode = mode('jumpboxMode')
      this.ami = mode('ami')
      this.key = mode('key')
      this.load = mode('load')
      this.target = mode('target')
      this.clusterMode = mode('clusterMode')
      this.serviceMode = mode('serviceMode')
      this.taskMode = mode('taskMode')
      this.databaseMode = mode('databaseMode')
    },
    presetDefault () {
      this.usePresets({
        availabilityZones: 'show',
        subnets: 'expand',
        instances: 'show',
        jumpboxMode: 'show',
        load: 'show'
      })
    },
    presetSecGrps () {
      this.usePresets({
        vpc: 'expand',
        // availabilityZones: 'expand',
        secgrp: 'expand',
        instances: 'show',
        jumpboxMode: 'show',
        databaseMode: 'show',
        cacheMode: 'show',
        load: 'show'
      })
    },
    presetClusters () {
      this.usePresets({
        load: 'expand',
        target: 'expand',
        clusterMode: 'expand',
        serviceMode: 'expand',
        taskMode: 'expand'
      })
    },
    presetVpcs () {
      this.usePresets({
        vpc: 'expand',
        subnets: 'expand',
        availabilityZones: 'expand',
        instances: 'show'
      })
    },
    presetNetworks () {
      this.usePresets({
        subnets: 'expand',
        internet: 'expand',
        route: 'expand',
        natGateways: 'expand',
        networkInterfaces: 'expand',
        elastic: 'expand',
        public: 'expand'
      })
    },
    presetInstances () {
      this.usePresets({
        instances: 'expand',
        load: 'expand',
        target: 'expand',
        serviceMode: 'expand',
        taskMode: 'expand'
      })
    },
    presetAll () {
      console.log('presetAll')
      this.usePresets({
        vpc: 'expand',
        availabilityZones: 'expand',
        subnets: 'expand',
        internet: 'expand',
        route: 'expand',
        natGateways: 'expand',
        networkInterfaces: 'expand',
        secgrp: 'expand',
        elastic: 'expand',
        public: 'expand',
        instances: 'expand',
        jumpboxMode: 'expand',
        ami: 'expand',
        key: 'expand',
        load: 'expand',
        target: 'expand',
        clusterMode: 'expand',
        serviceMode: 'expand',
        taskMode: 'expand'
      })
    },
    presetNone () {
      this.usePresets({

      })
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
  height: 70vh;
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

.my-mode-selectors {
  font-size: 11px;
}

.column.sidebar-title {
  margin-left: 20px;
  text-align: center;
  font-size: 9px;
}

.columns.sidebar-items {
  margin-bottom: 0px;
}

.columns.sidebar-items input[type='range'] {
  width: 60%;
}

.columns.sidebar-items .column:nth-child(2) {
  text-align: center;
}

.mypresets {
  margin-left: 5px;
  margin-top: 10px;
  margin-bottom: 15px;
  font-size: 13px;
  color: #999;
}
.mypresets button {
  margin-left: 10px;
}

hr {
  margin-top: 0px;
  margin-bottom: 10px;
  // padding-right: 10px;
}
</style>
