<template lang="pug">
  .top
    .card(style="min-width: 0%;")
      .link(v-if="idAsLabel === '' || idAsLabel === 'true'" rel="CSS")
        router-link(v-bind:to="'/node/' + node.key") {{ node.id }}
      .link(v-else rel="CSS")
        router-link(v-bind:to="'/node/' + node.key") {{ node.key }}
      .name {{ label }}
      .desc {{ description }}

    pre(v-if="showData === '' || showData === 'true'" rel="CSS")
      | {{ node.data }}

</template>

<script>
export default {
  name: 'id',
  props: [
    'node',
    'showData',
    'idAsLabel'
  ],
  computed: {
    label: function () {
      let label = ''
      if (this.node.data && this.node.data.Tags) {
        this.node.data.Tags.filter(tag => tag.Key === 'Name').forEach(tag => { label = tag.Value })
      }
      if (!label && this.node.Name) {
        label = this.node.Name
      }
      return label
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

  .name {
    font-size: 0.8em;
  }

  .desc {
    font-family: "Helvetica Narrow","Arial Narrow",Tahoma,Arial,Helvetica,sans-serif;
    font-size: 0.7em;
    color: #aaa;
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
