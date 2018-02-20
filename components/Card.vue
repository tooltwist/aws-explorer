<template lang="pug">
  .top
    CardForInstance(v-if="node.type === 'EC2 Instance'" v-bind:node="node" v-bind:show-type="showType")
    CardForVPC(v-else-if="node.type === 'Virtual Private Cloud'" v-bind:node="node" v-bind:show-type="showType")
    .card(v-else style="min-width: 0%;")
      div(v-if="showType")
        .mytype
          | {{node.type}}
        .myid
          | {{id}}
        br
      router-link(v-bind:to="urlForNode(node)") {{ label }}
      // .link(v-if="idAsLabel === '' || idAsLabel === 'true'" rel="CSS")
        // router-link(v-bind:to="urlForNode(node)") {{ node.id }}
      // .link(v-else rel="CSS")
      //   //router-link(v-bind:to="'/node/' + node.key") {{ node.key }}
      //   //br
      //   | 1b.
      //   router-link(v-bind:to="urlForNode(node)") {{ label }}
      // .nameZ 2. {{ label }}
      .name {{ description }}

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


  .node-card {
    display: inline-block;
    //font-family: Helvetica;
    min-height: 70px;
    border: solid 1px #cce;
    width: 300px;
    padding: 3px;
    margin: 10px;
  }

  .card {
    margin-bottom: 10px;
    min-height: 30px;
    padding-left: 5px;
  }

  .heading router-link {
    font-weight: strong;
    //font-size: 0.8em;
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

  .name {
    font-size: 0.8em;
  }

  .desc {
    font-family: "Helvetica Narrow","Arial Narrow",Tahoma,Arial,Helvetica,sans-serif;
    font-size: 0.7em;
    color: #999;
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
