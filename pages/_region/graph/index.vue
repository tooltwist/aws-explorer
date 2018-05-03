<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered Network
          //- p.subtitle -
        //- h1

        .content
          .card
            .card-content
              vis-network(v-bind:index="index" ZZZv-bind:initialNodesFn="useAsInitialNode" ZZZv-bind:rulesFn="getRuleForNode")
            //- card-content
          //- card
        //- content
      //- container
    //- section
  //- page
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
    let region = context.params.region
    console.log('GRAPH PAGE. Region is ' + region)
    let nodeId = null
    context.store.commit('setRegion', region)
    return GraphClient(region, nodeId, false, context.error)
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

<style>

</style>
