<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered Instance
          //- p.subtitle -
        //- h1

        .tabs.is-centered
          ul
            li.is-active
              nuxt-link(v-bind:to="'/' + region + '/instance/' + node.id") Relationships
            //- li
            li
              nuxt-link(v-bind:to="'/' + region + '/instance/' + node.id + '/ecs'") ECS
            //- li
            li
              nuxt-link(v-bind:to="'/' + region + '/instance/' + node.id + '/network'") Network
            //- li
          //- ul
        //- tabs
        .card
          .card-content
            vis-hierarchy(v-bind:node="node")
          //- card-content
        //- card
        .content
          .columns
            .column.has-text-centered
              h3 Is-used-by
              article(v-for="parentId in node.parents")
                node-card(v-bind:node="index[parentId]")
              //- article
            //- column
            .column.has-text-centered(style="min-width: 0;")
              h3 Current node
              article
                node-card(v-bind:node="node" show-data="true")
              //- article
            //- column
            .column.has-text-centered
              h3 Uses
              article(v-for="childId in node.children")
                node-card(v-bind:node="index[childId]")
              //- article
            //- column
          //- columns
        //- content

      //- container
    //- section
  //- page
</template>

<script>
import NodeCard from '~/components/Card.vue'
import GraphClient from '~/lib/graphClient'
import types from '~/lib/types'
import VisHierarchy from '~/components/VisHierarchy'

export default {
  name: 'id',
  components: {
    NodeCard,
    VisHierarchy
  },
  data: function () {
    let region = this.$route.params.region
    console.log(`Region in data() is ${region}`)
    return {
      region: this.$route.params.region
    }
  },
  asyncData (context) {
    // console.log('LOADING NODE ', context.params)
    // let nodeId = `${types.INSTANCE}::${context.params.instanceId}`
    // console.log('nodeId=' + nodeId)
    // return GraphClient(nodeId, context.error)

    let region = context.params.region
    let nodeId = context.params.instanceId
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
  }
  // methods: {
  //   findNode: nodeId => {
  //     console.log(`findNode(${nodeId})`)
  //     let node = graph.findNode(nodeId)
  //     console.log('found Node', node)
  //     return node
  //   }
  // }
  // validate ({ params }) {
  //   // Must be a number
  //   console.log('validate params:', params)
  //   // return /^\d+$/.test(params.id)
  //   return true
  // }

}
</script>

<style>

</style>
