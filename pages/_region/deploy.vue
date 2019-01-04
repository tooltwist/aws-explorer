<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered Deploy
          //- p.subtitle -
        //- h1
        
        .content
          label(for='environment') Environment
          input(type='text'
            name='environment'
            placeholder='Type name for your environment' class='textfield')
          button(type='button' class='btn btn-deploy') Create
          br
          br
          p Each environment requires a master Key Pair used to access the servers. Follow the instructions below to create your Key Pair.
          ol
            li
              a(:href="'https://' + $store.state.region + '.console.aws.amazon.com/console/home?region=' + $store.state.region + '#'" target="_blank") Click this link
            li Create a key pair named: nbt-testenv-ap-northeast-1
            li The keypair should be automatically downloaded to you machine
            li Open your Terminal and type:
              pre $ mv ~/Downloads/nbt-testenv-ap-northeast-1.pem ~/.ssh
            li Then change the PEM file's permission by typing:
              pre $ chmod 600 ~/.ssh/nbt-testenv-ap-northeast-1.pem
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
