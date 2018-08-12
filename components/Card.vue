<template lang="pug">
  .card.my-card(@click="jumpToNode(node)")
    CardForInstance(v-if="node.type === 'EC2 Instance'" v-bind:node="node" v-bind:show-type="showType")
    CardForVPC(v-else-if="node.type === 'Virtual Private Cloud'" v-bind:node="node" v-bind:show-type="showType")

    // Default card
    .card-content(v-else style="min-width: 0%;")
      .show-type(v-if="showType")
        .my-type {{node.type}}
        .my-id(v-if="id") {{id}}

      // b-icon(icon="link", size="is-small")
      .my-label {{ label }}
      .my-description {{ description }}

    pre(v-if="showData === '' || showData === 'true'" rel="CSS")
      | {{ node.data }}
</template>

<script>
import types from '../lib/types'
import urlForNode from '~/lib/urlForNode.js'
import CardForInstance from '~/components/Card-Instance'
import CardForVPC from '~/components/Card-VPC'

export default {
  name: 'id',
  components: {
    CardForInstance,
    CardForVPC
  },
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
    jumpToNode: function (node) {
      let region = this.$store.state.region
      let url = urlForNode(region, node)

      console.log(`Jump to ${url}`, this.$router)
      this.$router.push(url)
    }
  }
}
</script>
