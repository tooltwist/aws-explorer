<template lang="pug">
  .card.my-card(@click="jumpToNode(node)")
    .card-content(style="min-width: 0%;")
      .show-type(v-if="showType")
        .my-type
          img.awsicon(src="/aws-images/General_virtualprivatecloud.png")
          | {{node.type}}
        .my-id {{ node.data.VpcId }}

      //- b-icon(icon="link", size="is-small")
      .my-label environment = {{ label }}

      //- b-icon(icon="link", size="is-small")
      //- | {{ node.VpcId }}

    pre(v-if="showData === '' || showData === 'true'" rel="CSS")
      | {{ node.data }}
</template>
<script>
import urlForNode from '~/lib/urlForNode.js'
import types from '../lib/types'

export default {
  name: 'id',
  props: [
    'showType',
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
