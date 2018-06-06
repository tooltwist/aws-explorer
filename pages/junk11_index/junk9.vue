<template>
  <section class="container">
    <div>
      <logo/>
      <h1 class="title">
        Junk 9
      </h1>
      <div class="links">
        <!--
        <a href="https://nuxtjs.org/" target="_blank" class="button--green">Option A</a>
        <a href="https://github.com/nuxt/nuxt.js" target="_blank" class="button--grey">Option B</a>
      -->
        <router-link to="/" class="button--grey">Home</router-link>
        <router-link to="/stuff" class="button--grey">Stuff</router-link>
      </div>
    </div>
  </section>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  },
  asyncData (context) {
    // called every time before loading the component
    console.log('*** index/junk9.vue: asyncData()', context.route.params.env)
    return { environment: context.route.params.env }
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
