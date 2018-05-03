<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered Environment ENV
          p.subtitle {{environment}}
        //- h1

        .content
          .links
            router-link.button--grey(to="/") Home
            |
            router-link.button--grey(to="/stuff") Stuff
          //- links
        //- content
      //- container
    //- section
  //- page
</template>
<script>
import GraphClient from '~/lib/graphClient.js'
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  },
  asyncData (context) {
    // called every time before loading the component
    // console.log('asyncData()', context.route.params.env)
    // return { environment: context.route.params.env }
    let region = context.params.region
    let nodeId = context.params.env
    context.store.commit('setRegion', region)
    return GraphClient(region, nodeId, false, context.error)
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
<style lang="scss">

</style>
