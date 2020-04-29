<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered Environments
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
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  },
  fetch () {
    // The `fetch` method is used to fill the store before rendering the page
  },
  asyncData (context) {
    // called every time before loading the component
    console.log('asyncData()', context.route.params.env)
    return { environment: context.route.params.env }
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
