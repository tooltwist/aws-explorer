<template>
  <section class="container">
    <div>
      <h1 class="title">
        EnvironmentZZZ
      </h1>
      <h2 class="subtitle">
        {{environment}}
      </h2>
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
    console.log('asyncData()', context.route.params.env)
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
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
  display: block;
  font-weight: 300;
  font-size: 100px;
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

.links {
  padding-top: 15px;
}
</style>
