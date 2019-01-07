<template lang="pug">
    #instructions
      p Each environment requires a master Key Pair used to access the servers. Follow the instructions below to create your Key Pair.
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
</template>
<style>
  .highlighted {
    color: #41b883;
  }
</style>