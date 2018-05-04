<template lang="pug">
  .card
    CardForInstance(v-if="node.type === 'EC2 Instance'" v-bind:node="node" v-bind:show-type="showType")
    CardForVPC(v-else-if="node.type === 'Virtual Private Cloud'" v-bind:node="node" v-bind:show-type="showType")
    .card-content(v-else style="min-width: 0%;")
      .show-type(v-if="showType")
        p.mytype
          | {{node.type}}
        //- p
        h6.subtitle.is-6.myid
          | {{id}}
        //- h5
      //- div
      router-link(v-bind:to="urlForNode(node)")
        b-icon(icon="link", size="is-small")
        | {{ label }}
      //- router-link
      .name {{ description }}
    //- card-content
    pre(v-if="showData === '' || showData === 'true'" rel="CSS")
      | {{ node.data }}
    //- pre
  //- card
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
