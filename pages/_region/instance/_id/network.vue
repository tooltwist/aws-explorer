<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered Instance - Network View
          //- p.subtitle -
        //- h1

        .tabs.is-centered
          ul
            li
              nuxt-link(v-bind:to="'/' + region + '/instance/' + node.id") Relationships
            //- li
            li
              nuxt-link(v-bind:to="'/' + region + '/instance/' + node.id + '/ecs'") ECS
            //- li
            li.is-active
              nuxt-link(v-bind:to="'/' + region + '/instance/' + node.id + '/network'") Network
            //- li
          //- ul
        //- tabs
        .content
          .card
            .card-content
              vis-network(v-bind:index="index" v-bind:initialNodesFn="useAsInitialNode" v-bind:rulesFn="getRuleForNode")
            //- card-content
          //- card
          h3 All
          .button.is-text Yawza
          nuxt-link.button.is-text(to="/" class="button") Home
          nuxt-link.button.is-text(to="/stuff" class="button") Stuff
        //- content

      //- container
    //- section
  //- page
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
    let region = context.params.region
    let nodeId = context.params.id
    let prefix = types.INSTANCE + '::'
    if (!nodeId.startsWith(prefix)) {
      nodeId = prefix + nodeId
    }
    console.log('nodeId=' + nodeId)
    context.store.commit('setRegion', region)
    return GraphClient(context.$axios, region, nodeId, false, context.error)
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
<style>

</style>
