<template lang="pug">
.page
  .container.has-text-centered
    //img(src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo")
    h1.title EC2 Instances
    hr
    br

  .content
    .vpc(v-for="node in list" style="display:block;")
      div(v-if="node.type == 'EC2 Instance'")
        node-card(v-bind:node="node" id-as-label)
</template>

<script>
import NodeCard from '~/components/Card.vue'
// import Logo from '~/components/Logo.vue'
import GraphClient from '~/lib/graphClient.js'

export default {
  components: {
    NodeCard
  },
  asyncData (context) {
    // called every time before loading the component
    return GraphClient(context.params.id, context.error)
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
