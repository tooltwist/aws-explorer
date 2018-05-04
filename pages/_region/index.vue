<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered Home
          p.subtitle {{$store.list}}
        //- h1
        
      //- container
    //- section
  //- page
</template>
<script>

export default {
  components: {
  },
  async asyncData (context) {

  },
  methods: {

  },
  head () {
    return {
      title: 'Home'
    }
  },
  created () {

  }
}
</script>
<style>

</style>
