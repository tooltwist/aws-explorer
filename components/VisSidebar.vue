<template lang="pug">
  .columns
    .column
      |  
      .columns
        .column
          | {{label}}
      .columns
        .column
          | VPCs:
      .columns
        .column
          | Subnets:
      .columns
        .column
          | Availability Zone:
      .columns
        .column
          | Internet Gateway:
      .columns
        .column
          | Route Tables:
      .columns
        .column
          | NAT Gateways:
      .columns
        .column
          | Network Interfaces:
      .columns
        .column
          | Elastic IPs:
      .columns
        .column
          | Public IP Addresses:
      .columns
        .column
          | Security Group:
      .columns
        .column
          | Instances:
      .columns
        .column
          | Jumpboxes:
      .columns
        .column
          | AMI Images:
      .columns
        .column
          | Key Pairs:
      .columns
        .column
          | Load Balancers:
      .columns
        .column
          | Target Groups:
      .columns
        .column
          | Clusters:
      .columns
        .column
          | Services:
      .columns
        .column
          | Tasks:
    .column
      .columns
        .column
          | S
        .column
          | H
        .column
          | E
      .columns
        .column
          input(type='radio', id=`${this.model}-show` value='show' v-model=`${this.model}`)
        .column
          input(type='radio', id=`${this.model}-hide` value='hide' v-model=`${this.model}`)
        .column
          input(type='radio', id=`${this.model}-expand` value='expand' v-model=`${this.model}`)
</template>

<script>
export default {
  name: 'VisSidebar',
  components: {
  },
  props: [
    'label',
    'model'
  ],
  methods: {
  }
}
</script>

<style scoped>
</style>
