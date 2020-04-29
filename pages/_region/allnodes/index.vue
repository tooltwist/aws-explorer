<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered All Nodes
          p.subtitle {{$store.list}}
        //- h1
        .content
          .columns.is-multiline

            .column
              h3 Environments
              .vpc(v-for="node in list" v-if="searchTags(node, 'Environment') && node.type == 'Virtual Private Cloud'")
                node-card(v-bind:node="node" show-type="true")
              h3 VPCs
              .vpc(v-for="node in list" v-if="node.type == 'Virtual Private Cloud'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Availability Zones
              .vpc(v-for="node in list" v-if="node.type == 'Availability Zone'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Subnets
              .vpc(v-for="node in list" v-if="node.type == 'Subnet'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
            //- column

            .column
              h3 Internet gateways
              .vpc(v-for="node in list" v-if="node.type == 'Internet Gateway'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 NAT Gateways
              .vpc(v-for="node in list" v-if="node.type == 'NAT Gateway'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Route Tables
              .vpc(v-for="node in list" v-if="node.type == 'Route Table'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
            //- column

            .column
              h3 Elastic IPs
              .vpc(v-for="node in list" v-if="node.type === 'Elastic IP'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Public IP Addresses
              .vpc(v-for="node in list" v-if="node.type === 'Public IP Address'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Network Interfaces
              .vpc(v-for="node in list" v-if="node.type === 'Network Interface'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc

            .column
              h3 Instances
              .vpc(v-for="node in list" v-if="node.type === 'EC2 Instance'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Jump Boxes
              .vpc(v-for="node in list" v-if="node.type === 'Jumpbox'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 AMI Images
              .vpc(v-for="node in list" v-if="node.type === 'AMI Image'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Key Pairs
              .vpc(v-for="node in list" v-if="node.type === 'Key Pair'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Security Groups
              .vpc(v-for="node in list" v-if="node.type === 'Security Group'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Other
              .vpc(v-for="node in list" v-if="isUnknownType(node)")
                // | {{node.key}} ,{{node.type}}.
                node-card(v-bind:node="node" show-type="true")
              //- vpc

            .column
              h3 Load Balancers
              .vpc(v-for="node in list" v-if="node.type === 'Load Balancer'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Target Groups
              .vpc(v-for="node in list" v-if="node.type === 'Target Group'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Clusters
              .vpc(v-for="node in list" v-if="node.type === 'Cluster'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Services
              .vpc(v-for="node in list" v-if="node.type === 'Service'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Tasks
              .vpc(v-for="node in list" v-if="node.type === 'Task'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Databases
              .vpc(v-for="node in list" v-if="node.type === 'Database'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
              h3 Caches
              .vpc(v-for="node in list" v-if="node.type === 'Cache'")
                node-card(v-bind:node="node" show-type="true")
              //- vpc
            //- column

          //- columns
        //- content
      //- container
    //- section
  //- page
</template>
<script>
import GraphClient from '~/lib/graphClient.js'
import NodeCard from '~/components/Card.vue'

export default {
  components: {
    NodeCard
  },
  async asyncData ({ $axios, query, params, store, error }) {
    console.log('asyncData. query=', query)
    let reload = false
    if (query.reload) {
      reload = true
    }
    console.log('yarp 1')
    let region = params.region
    let nodeId = params.id
    console.log('yarp 2')
    store.commit('setRegion', region)
    if ($axios) {
      console.log(`yarp 3: Have $axios`)
    } else {
      console.log(`yarp 3: missing $axios`)
    }
    return GraphClient($axios, region, nodeId, reload, error)
  },
  methods: {
    isUnknownType: function (n) {
      // console.log('isUnknownType: ' + n.type)
      return (
        n.type !== 'Virtual Private Cloud' &&
        n.type !== 'Availability Zone' &&
        n.type !== 'Subnet' &&

        n.type !== 'Internet Gateway' &&
        n.type !== 'NAT Gateway' &&
        n.type !== 'Route Table' &&

        n.type !== 'Elastic IP' &&
        n.type !== 'Public IP Address' &&
        n.type !== 'Network Interface' &&

        n.type !== 'EC2 Instance' &&
        n.type !== 'Jumpbox' &&
        n.type !== 'AMI Image' &&
        n.type !== 'Key Pair' &&
        n.type !== 'Security Group' &&

        n.type !== 'Load Balancer' &&
        n.type !== 'Target Group' &&
        n.type !== 'Cluster' &&
        n.type !== 'Service' &&
        n.type !== 'Task' &&
        n.type !== 'Database' &&
        n.type !== 'Cache'
      )
    },
    searchTags (node, key) {
      if (node.data) {
        const tags = 'Tags' in node.data
        if (tags) {
          const arrTags = node.data.Tags
          for (var i in arrTags) {
            if (arrTags[i].Key === key) {
              return true
            }
          }
        }
      }
    }
  },
  head () {
    return {
      title: 'All Nodes'
    }
  }
}
</script>
<style>

</style>
