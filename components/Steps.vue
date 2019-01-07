<template lang="pug">
    #instructions
      p(class="mb15") Each environment requires a master Key Pair used to access the servers. Follow the instructions below to create your Key Pair.
      ol
        li
          a(:href="'https://' + $store.state.region + '.console.aws.amazon.com/ec2/v2/home?region=' + $store.state.region + '#KeyPairs:sort=keyName'"
          class="highlighted"
          target="_blank") Click this link

        li Create a key pair named: <span class="highlighted">nbt-{{$store.state.envName}}-{{$store.state.region}}</span> (the PEM file should automatically be downloaded to you machine)
        li Open your Terminal and type:
          pre $ mv ~/Downloads/nbt-{{$store.state.envName}}-{{$store.state.region}}.pem ~/.ssh
        
        li Then change the PEM file's permission by typing:
          pre $ chmod 600 ~/.ssh/nbt-{{$store.state.envName}}-{{$store.state.region}}.pem
        li If using a Mac, also type:
          br
          pre
            span xattr -d com.apple.metadata:kMDItemWhereFroms ~/.ssh/nbt-{{$store.state.envName}}-{{$store.state.region}}.pem
            br
            span xattr -d com.apple.quarantine ~/.ssh/nbt-{{$store.state.envName}}-{{$store.state.region}}.pem
      p(class="mt15") Click the 'Proceed' button below when all steps have been completed
      button(type='button'
        class='btn btn-createuser'
        v-on:click="createUser") Proceed
</template>
<script>
export default {
  methods: {
    createUser: function () {
      console.log('creating user...')

      var AWS = require('aws-sdk')
      var iam = new AWS.IAM()

      var params = {
        UserName: 'Bob'
      }
      iam.createUser(params, function (err, data) {
        if (err) {
          console.log(err, err.stack)
        } else {
          console.log(data)
        }
        /*
        data = {
          User: {
            Arn: "arn:aws:iam::123456789012:user/Bob",
            CreateDate: <Date Representation>,
            Path: "/",
            UserId: "AKIAIOSFODNN7EXAMPLE",
            UserName: "Bob"
          }
        }
        */
      })
    }
  }
}
</script>
<style>
  button {
    background: #41b883;
    color: #fff;
  }
  ol {
    margin-left: 20px;
  }
  .highlighted {
    color: #41b883;
  }
  .mb15 {
    margin-bottom: 15px;
  }
  .mt15 {
    margin-top: 15px;
  }
</style>
