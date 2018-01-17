<template lang="pug">
  .page
    .container.has-text-centered
      //img(src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo")
      h1.title Instance - Network View
      //h2.info {{ node.key }}
    br
    .tabs
      ul
        li
          nuxt-link(v-bind:to="'/instance/' + node.key") Relationships
        li
          nuxt-link(v-bind:to="'/instance/' + node.key + '/ecs'") ECS
        li.is-active
          nuxt-link(v-bind:to="'/instance/' + node.key + '/network'") Network
    .container
      //  .columns
      //    .column.has-text-centered(style="min-width: 0;")
      //      h3 Current node
      //      node-card(v-bind:node="node" show-data="true")

        //.column.has-text-centered
        //  h3 Uses
        //  ul
        //    li(v-for="childId in node.children")
        //      node-card(v-bind:node="index[childId]")
      vis-network(v-bind:index="index" v-bind:initialNodesFn="useAsInitialNode" v-bind:rulesFn="getRuleForNode")

      h3 All
      //ul
        //li(v-for="item in list")
        //  router-link(v-bind:to="'/node/' + item.key") {{ item.key }}
      .button.is-link Yawza
      nuxt-link(to="/" class="button") Home
      nuxt-link(to="/stuff" class="button") Stuff
      br
</template>

<script>
import NodeCard from '~/components/Card.vue'
import GraphClient from '~/lib/graphClient'
import types from '~/lib/types'
import VisNetwork from '~/components/VisNetwork.vue'

export default {
  name: 'id',
  components: {
    NodeCard,
    VisNetwork
  },
  asyncData (context) {
    let nodeId = context.params.id
    let prefix = types.INSTANCE + '::'
    if (!nodeId.startsWith(prefix)) {
      nodeId = prefix + nodeId
    }
    console.log('nodeId=' + nodeId)
    return GraphClient(nodeId, context.error)
  },
  // fetch () {
  //   // The `fetch` method is used to fill the store before rendering the page
  // },
  head () {
    // Set Meta Tags for this Page
    return {
      title: 'Hello'// `Node: ${this.node.name}`
    }
  },
  methods: {
    useAsInitialNode: function (key, index) {
      let currentNode = this.node
      console.log('Use as initial node: ' + currentNode.key)
      return (key === currentNode.key)
    },
    getRuleForNode: function (key) {
      console.log(`getRuleForNode(${key})`)

      if (key.startsWith(types.CLUSTER)) return 'hide'
      if (key.startsWith(types.TASK)) return 'hide'
      if (key.startsWith(types.IMAGE)) return 'hide'
      if (key.startsWith(types.AZ)) return 'hide'
      if (key.startsWith(types.ROUTETABLE)) return 'hide'
      if (key.startsWith(types.VPC)) return 'hide'
      // if (key.startsWith(types.SECGRP)) return 'hide'
      // if (key.startsWith(types.IGW)) return 'hide'
      /*
      if (key.startsWith('AMI ')) return 'hide'
      if (key.startsWith('Security ')) return 'expand'
      if (key.startsWith('EC2 ')) return 'expand'
      // return 'expand' // Show everything
      return 'expand'
      */
      return 'expand'
    }
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
</style>
