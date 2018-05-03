<template lang="pug">
  .body
    my-sidebar
    .page-inject
      nuxt
      my-footer
    //- page-inject
  //- body
</template>
<script>
import MySidebar from '~/components/Sidebar.vue'
import MyFooter from '~/components/Footer.vue'
export default {
  components: {
    'my-sidebar': MySidebar,
    'my-footer': MyFooter
  }
}
</script>
<style>

</style>
