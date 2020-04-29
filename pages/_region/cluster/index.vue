<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered Node
          //- p.subtitle -
        //- h1

        .content
          h3 Here are our vpcs
          .columns
            .column(v-for="node in list", v-if="node.type == 'Cluster'")
              // | {{node.key}} ,{{node.type}}.
              // br
              node-card(v-bind:node="node")
              // node-card(v-if="node.type === 'Virtual Private Cloud' v-bind:node="node")
            //- column
          //- columns
        //- content
      //- container
    //- section
  //- page
</template>

<script>
import NodeCard from '~/components/Card.vue'
import GraphClient from '~/lib/graphClient.js'

export default {
  components: {
    NodeCard
  },
  asyncData (context) {
    let region = context.params.region
    let nodeId = null
    context.store.commit('setRegion', region)
    return GraphClient(context.$axios, region, nodeId, false, context.error)
  },
  head () {
    // Set Meta Tags for this Page
  },
  validate ({ params }) {
    // Must be a number
    console.log('validate params:', params)
    // return /^\d+$/.test(params.id)
    return true
  }

}
</script>

<style>

</style>
