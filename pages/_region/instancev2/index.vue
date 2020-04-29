<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered EC2 Instances
          //- p.subtitle -
        //- h1

        .content
          .vpc(v-for="node in list" style="display:block;")
            div(v-if="node.type == 'EC2 Instance'")
              node-card(v-bind:node="node" id-as-label)
            //- div
          //- vpc
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
  fetch () {
    // The `fetch` method is used to fill the store before rendering the page
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
