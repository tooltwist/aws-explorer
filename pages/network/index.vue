<template lang="pug">
  .page
    .container.has-text-centered
      //img(src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo")
      h1.title Network
      h2.info
      hr
      br
    vis-network(v-bind:index="index" ZZZv-bind:initialNodesFn="useAsInitialNode" ZZZv-bind:rulesFn="getRuleForNode")
</template>

<script>
import GraphClient from '~/lib/graphClient'
import VisNetwork from '~/components/VisNetwork.vue'

// import _ from 'lodash'

export default {
  name: 'id',
  components: {
    VisNetwork
  },
  asyncData (context) {
    // Hack. This page gets loaded when the map file for bulma is loaded.
    // We don't want to load data in this case.
    // if (context.params.id === 'bulma.css.map') {
    //   console.log('Ignoring asyncData (route for bulma.css.map)')
    //   return
    // }

    console.log('LOADING NODE ', context.params)

    return GraphClient(context.params.id, context.error)
  },
  methods: {
    useAsInitialNode: function (key, index) {
      let testHack = true
      if (testHack) {
        // Only add a single instance
        return (key === 'EC2 Instance::i-0c1264c8a4c4a400a')
        // return (index < 10)
        // return (key.indexOf('Virtual') === 0)
      }

      // Add ALL nodes to the display
      return true // All Nodes
    },
    getRuleForNode: function (key) {
      console.log(`getRuleForNode(${key})`)
      // if (key.startsWith('Availability')) return 'show'
      if (key.startsWith('AMI ')) return 'hide'
      if (key.startsWith('Security ')) return 'expand'
      if (key.startsWith('EC2 ')) return 'expand'
      // return 'expand' // Show everything
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
