<template lang="pug">
.page
  .container.has-text-centered
    //img(src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo")
    h1.title All Nodes
    hr
    br

  .content
    .columns
      .column
        h3 Environments
        h3 VPCs
          .vpc(v-for="node in list" v-if="node.type == 'Virtual Private Cloud'")
            node-card(v-bind:node="node" id-as-label)
        h3 Availability Zones
          .vpc(v-for="node in list" v-if="node.type == 'Availability Zone'")
            node-card(v-bind:node="node" id-as-label)
        h3 Subnets
          .vpc(v-for="node in list" v-if="node.type == 'Subnet'")
            node-card(v-bind:node="node" id-as-label)
      .column
        h3 Internet gateways
          .vpc(v-for="node in list" v-if="node.type == 'Internet Gateway'")
            node-card(v-bind:node="node" id-as-label)
        h3 NAT Gateways
          .vpc(v-for="node in list" v-if="node.type == 'NAT Gateway'")
            node-card(v-bind:node="node" id-as-label)
        h3 Route Tables
          .vpc(v-for="node in list" v-if="node.type == 'Route Table'")
            node-card(v-bind:node="node" id-as-label)
      .column
        h3 Elastic IPs
          .vpc(v-for="node in list" v-if="node.type === 'Elastic IP'")
            node-card(v-bind:node="node" id-as-label)
        h3 Public IP Addresses
          .vpc(v-for="node in list" v-if="node.type === 'Public IP Address'")
            node-card(v-bind:node="node" id-as-label)
        h3 Network Interfaces
          .vpc(v-for="node in list" v-if="node.type === 'Network Interface'")
            node-card(v-bind:node="node" id-as-label)
      .column
        h3 Instances
          .vpc(v-for="node in list" v-if="node.type === 'EC2 Instance'")
            node-card(v-bind:node="node" id-as-label)
        h3 AMI Images
          .vpc(v-for="node in list" v-if="node.type === 'AMI Image'")
            node-card(v-bind:node="node" id-as-label)
        h3 Key Pairs
          .vpc(v-for="node in list" v-if="node.type === 'Key Pair'")
            node-card(v-bind:node="node" id-as-label)
        h3 Security Groups
          .vpc(v-for="node in list" v-if="node.type === 'Security Group'")
            node-card(v-bind:node="node" id-as-label)
        h3 Other
          .vpc(v-for="node in list" v-if="isUnknownType(node)")
            // | {{node.key}} ,{{node.type}}.
            node-card(v-bind:node="node" id-as-label)
      .column
        h3 Load Balancers
          .vpc(v-for="node in list" v-if="node.type === 'Load Balancer'")
            node-card(v-bind:node="node" id-as-label)
        h3 Target Groups
          .vpc(v-for="node in list" v-if="node.type === 'Target Group'")
            node-card(v-bind:node="node" id-as-label)
        h3 Clusters
          .vpc(v-for="node in list" v-if="node.type === 'Cluster'")
            node-card(v-bind:node="node" id-as-label)
        h3 Services
          .vpc(v-for="node in list" v-if="node.type === 'Service'")
            node-card(v-bind:node="node" id-as-label)
        h3 Tasks
          .vpc(v-for="node in list" v-if="node.type === 'Task'")
            node-card(v-bind:node="node" id-as-label)
    hr

</template>

<script>
import GraphClient from '~/lib/graphClient.js'
import NodeCard from '~/components/Card.vue'

export default {
  components: {
    NodeCard
  },
  async asyncData (context) {
    return GraphClient(context.params.id, context.error)
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
        n.type !== 'AMI Image' &&
        n.type !== 'Key Pair' &&
        n.type !== 'Security Group' &&

        n.type !== 'Load Balancer' &&
        n.type !== 'Target Group' &&
        n.type !== 'Cluster' &&
        n.type !== 'Service' &&
        n.type !== 'Task' &&
        n.type !== 'ZZZZZ'
      )
    }
  },
  head () {
    return {
      title: 'All Nodes'
    }
  }
}
</script>

<style scoped>
.title
{
  margin: 30px 0;
}
.vpc
{
  font-size: 14px;
}
</style>
