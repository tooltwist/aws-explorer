<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered {{ node.key }}
          //- p.subtitle -
        //- h1

        .content
          .columns
            .column.has-text-centered(style="min-width: 0;")
              h3 Current node
              node-card(v-bind:node="node" show-data="true")
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
import GraphClient from '~/lib/graphClient.js'
import NodeCard from '~/components/Card.vue'

export default {
  name: 'id',
  components: {
    NodeCard
  },
  asyncData (context) {
    let region = context.params.region
    let nodeId = context.params.id
    context.store.commit('setRegion', region)
    return GraphClient(context.$axios, region, nodeId, false, context.error)
  },
  // fetch () {
  //   // The `fetch` method is used to fill the store before rendering the page
  // },
  head () {
    // Set Meta Tags for this Page
    return {
      title: `Node: ${this.node.name}`
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
