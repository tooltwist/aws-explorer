<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered Stuff
          //- p.subtitle -
        //- h1
        
        .content
          .links
            router-link.button.is-text(to="/") Home
            router-link.button.is-text(to="/environment/a") Environment A
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
  }
}
</script>

<style>

</style>
