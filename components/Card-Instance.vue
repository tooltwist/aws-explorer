<template lang="pug">
  .top
    .card(style="min-width: 0%;")
      div(v-if="showType")
        .mytype
          | {{node.type}}
        .myid
          | {{id}}
        br
      img.awsicon(src="/aws-images/Compute_AmazonEC2_instance.png")
      // .link(v-if="idAsLabel === '' || idAsLabel === 'true'" rel="CSS")
      //   router-link(v-bind:to="urlForNode(node)") {{ node.id }}
      // .link(v-else rel="CSS")
      //   router-link(v-bind:to="urlForNode(node)") {{ node.key }}
      router-link(v-bind:to="urlForNode(node)") {{ label }}
      .desc {{ description }}

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
  .mytype {
    color: #aaa;
    font-weight: strong;
    font-size: 0.8em;
    // text-align: left;
    float: left;
  }

  .myid {
    color: #aaa;
    font-weight: strong;
    font-size: 0.8em;
    float: right;
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
    max-width: 32px;
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
