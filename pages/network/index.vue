<template lang="pug">
  .page
    .container.has-text-centered
      //img(src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo")
      h1.title Network
      h2.info
      hr
      br
    vis-network(v-bind:index="index")
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
