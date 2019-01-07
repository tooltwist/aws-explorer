<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered Deploy
        hr
        label(for='envname') Environment
        input(type='text'
          class='textfield'
          name='envname',
          v-model="envName"
          placeholder='Type name for your environment')
        button(type='button'
          class='btn btn-deploy'
          v-on:click="showInstructions") Create
        br
        br
        steps(v-if="isVisible")
          
        //- content
      //- container
    //- section
  //- page
</template>

<script>
import Logo from '~/components/Logo.vue'
import Steps from '~/components/Steps.vue'

export default {
  components: {
    Logo,
    Steps
  },
  data () {
    return {
      isVisible: false,
      envName: ''
    }
  },
  methods: {
    showInstructions: function () {
      this.isVisible = true
      this.$store.state.envName = this.envName
    }
  }
}
</script>

<style>
  label {
    display: block;
  }
  .textfield {
    font-size: 14px;
    margin-right: 10px;
    padding: 8px;
    width: 300px;
  }
  .btn {
    font-size: 14px;
    margin-top: 15px;
    padding: 8px 12px;
  }
</style>
