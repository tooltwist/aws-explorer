<template lang="pug">
  .card.my-card(@click="jumpToNode(node)")
    .card-content(style="min-width: 0%;")
      .show-type(v-if="showType")
        .my-type {{node.type}}
        .my-id {{id}}

      // img.awsicon(src="/aws-images/Compute_AmazonEC2_instance.png")
      // b-icon(icon="link", size="is-small")
      .my-label {{ label }}

      .my-description {{ description }}

    pre(v-if="showData === '' || showData === 'true'" rel="CSS")
      | {{ node.data }}
</template>

<script>
import types from '../lib/types'
import urlForNode from '~/lib/urlForNode.js'

export default {
  name: 'id',
  props: [
    'showType',
    'node',
    'showData',
    'idAsLabel'
  ],
  computed: {
    id: function () {
      return types.id(this.node)
    },
    label: function () {
      return types.label(this.node)
    },
    description: function () {
      return types.description(this.node)
    }
  },
  methods: {
    getName: function () {
      let name = ''
      if (this.node.data && this.node.data.Tags) {
        this.node.data.Tags.filter(tag => tag.Key === 'Name').forEach(tag => { name = tag.Value })
      }
      if (!name && this.node.Name) {
        name = this.node.Name
      }
      return name
    },
    getDescription: function () {
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
    },
    jumpToNode: function (node) {
      let region = this.$store.state.region
      let url = urlForNode(region, node)

      console.log(`Jump to ${url}`, this.$router)
      this.$router.push(url)
    }
  },
  created: function () {
    // console.log(this.node)
  }
}
</script>
