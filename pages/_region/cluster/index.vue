<template lang="pug">
.page
  .container.has-text-centered
    //img(src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo")
    h1.title Node
    hr
    br

  .content
    h3 Here are our vpcs
    .columns
      .column(v-for="node in list" style="display:block;" v-if="node.type == 'Cluster'")
        // | {{node.key}} ,{{node.type}}.
        // br
        node-card(v-bind:node="node")
        // node-card(v-if="node.type === 'Virtual Private Cloud' v-bind:node="node")
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
    return GraphClient(region, nodeId, false, context.error)
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
.container {
  //min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
  display: block;
  font-weight: 300;
  font-size: 42px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.vpc {
  max-width: 300px;
}

.links {
  padding-top: 15px;
}
</style>
