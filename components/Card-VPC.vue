<template lang="pug">
  .card
    .card-content(style="min-width: 0%;")
      img.awsicon(src="/aws-images/General_virtualprivatecloud.png")
      router-link(v-bind:to="urlForNode(node)")
        b-icon(icon="link", size="is-small")
        | {{ label }}
      //- router-link
      router-link(v-bind:to="urlForNode(node)")
        b-icon(icon="link", size="is-small")
        | {{ node.VpcId }}
      //- router-link
    //- card-content
    pre(v-if="showData === '' || showData === 'true'" rel="CSS")
      | {{ node.data }}
    //- pre
  //- card
</template>
<script>
import urlForNode from '~/lib/urlForNode.js'
import types from '../lib/types'

export default {
  name: 'id',
  props: [
    'node',
    'showData',
    'idAsLabel'
  ],
  computed: {
    label: function () {
      return types.label(this.node)
      /* let label = ''
      if (this.node.data && this.node.data.Tags) {
        this.node.data.Tags.filter(tag => tag.Key === 'Name').forEach(tag => { label = tag.Value })
      }
      if (!label && this.node.VpcId) {
        label = this.node.VpcId
      }
      return label */
    },
    description: function () {
      let desc = ''
      if (this.node.data) {
        if (this.node.data.Tags) {
          this.node.data.Tags.filter(tag => tag.Key === 'Description').forEach(tag => { desc = tag.Value })
        }
        if (!desc && this.node.data.Description) {
          desc = this.node.data.Description
        }
      }
      return desc
    }
  },
  methods: {
    urlForNode: function (node) {
      /* console.log('urlForNode() method') */
      let region = this.$store.state.region
      return urlForNode(region, node)
    }
  },
  created: function () {
    // console.log(this.node)
  }
}
</script>
<style lang="scss">
  pre {
    overflow-x: scroll;
    text-align: left;
    font-size: 10px;
    background-color: white !important;
    color: #99f;
  }
</style>
