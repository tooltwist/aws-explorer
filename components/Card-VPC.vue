<template lang="pug">
  .top
    .card(style="min-width: 0%;")
      img.awsicon(src="/aws-images/General_virtualprivatecloud.png")
      // .link(v-if="idAsLabel === '' || idAsLabel === 'true'" rel="CSS")
      //   router-link(v-bind:to="urlForNode(node)") {{ node.id }}
      // .link(v-else rel="CSS")
      //   router-link(v-bind:to="urlForNode(node)") {{ node.key }}
      router-link(v-bind:to="urlForNode(node)") {{ label }}
      router-link(v-bind:to="urlForNode(node)") {{ node.VpcId }}

    pre(v-if="showData === '' || showData === 'true'" rel="CSS")
      | {{ node.data }}

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
      if (this.node.data && this.node.data.Tags) {
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

  @import "~bulma";
  @import '~bulma/sass/utilities/mixins';

  .card {
    margin-bottom: 10px;
    min-height: 50px;
    padding-left: 5px;
  }

  .heading router-link {
    font-weight: strong;
    //font-size: 0.8em;
  }

  .name {
    font-size: 0.8em;
  }

  .desc {
    font-family: "Helvetica Narrow","Arial Narrow",Tahoma,Arial,Helvetica,sans-serif;
    font-size: 0.7em;
    color: #aaa;
  }

  .awsicon {
    margin-top: 5px;
    margin-bottom: 5px;
    margin-right: 5px;
    width: 48px;
    float: left;
    vertical-align: top;
  }
  pre {
    overflow-x: scroll;
    text-align: left;
    font-size: 10px;
    font-family: Helvetica;
    background-color: white !important;
    color: #99f;

    @include mobile {
      //color: red !important;
      max-width: 100%;
    }
    @include tablet-only {
      //color: green !important;
      max-width: 250px;
    }
    @include desktop-only {
      //color: blue !important;
      max-width: 305px;
    }
    @include widescreen-only {
      //color: brown !important;
      max-width: 370px;
    }
    @include fullhd {
      //color: purple !important;
      max-width: 440px;
    }
  }
</style>
