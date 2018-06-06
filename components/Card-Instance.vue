<template lang="pug">
  .card
    .card-content(style="min-width: 0%;")
      .show-type(v-if="showType")
        p.mytype
          | {{node.type}}
        //- p
        h6.subtitle.is-6.myid
          | {{id}}
        //- h5
      //- div
      img.awsicon(src="/aws-images/Compute_AmazonEC2_instance.png")
      router-link(v-bind:to="urlForNode(node)")
        b-icon(icon="link", size="is-small")
        | {{ label }}
      //- router-link
      .desc {{ description }}
    //- card-content
    pre(v-if="showData === '' || showData === 'true'" rel="CSS")
      | {{ node.data }}
    //- pre
  //- card
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
