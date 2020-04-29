<template lang="pug">
  section.container.is-fluid
    .columns.is-centered
      .column.has-text-centered
        br
        img(src='~/assets/img/logo-twist-vue.png', alt='ToolTwist')
        br
        br
        h1.title
          | {{ error.statusCode }}
        //- h1
        h2.info
          | {{ error.message }}
        //- h2
        br
        nuxt-link.button.is-light(to="/", v-if="error.statusCode === 404")
          | Homepage
        //- nuxt-link
      //- column
    //- columns
</template>
<script>
export default {
  props: {
    error: {
      type: Object
    }
  }
}
</script>

<style scoped>

</style>
