<template lang="pug">
  .page
    .container.has-text-centered
      //img(src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo")
      h1.title Instance
      //h2.info {{ node.key }}
    br
    .tabs
      ul
        li.is-active
          nuxt-link(v-bind:to="'/' + region + '/instance/' + node.id") Relationships
        li
          nuxt-link(v-bind:to="'/' + region + '/instance/' + node.id + '/ecs'") ECS
        li
          nuxt-link(v-bind:to="'/' + region + '/instance/' + node.id + '/network'") Network

    vis-hierarchy(v-bind:node="node")

    .container
      .columns
        .column.has-text-centered
          h3 Is-used-by
          ul
            li(v-for="parentId in node.parents")
              node-card(v-bind:node="index[parentId]")
          hr

        .column.has-text-centered(style="min-width: 0;")
          h3 Current node
          node-card(v-bind:node="node" show-data="true")

        .column.has-text-centered
          h3 Uses
          ul
            li(v-for="childId in node.children")
              node-card(v-bind:node="index[childId]")
</template>

<script>
import NodeCard from '~/components/Card.vue'
import GraphClient from '~/lib/graphClient'
import types from '~/lib/types'
import VisHierarchy from '~/components/VisHierarchy'

export default {
  name: 'id',
  components: {
    NodeCard,
    VisHierarchy
  },
  data: function () {
    let region = this.$route.params.region
    console.log(`Region in data() is ${region}`)
    return {
      region: this.$route.params.region
    }
  },
  asyncData (context) {
    // console.log('LOADING NODE ', context.params)
    // let nodeId = `${types.INSTANCE}::${context.params.instanceId}`
    // console.log('nodeId=' + nodeId)
    // return GraphClient(nodeId, context.error)

    let region = context.params.region
    let nodeId = context.params.instanceId
    let prefix = types.INSTANCE + '::'
    if (!nodeId.startsWith(prefix)) {
      nodeId = prefix + nodeId
    }
    console.log('nodeId=' + nodeId)
    return GraphClient(region, nodeId, false, context.error)
  },
  // fetch () {
  //   // The `fetch` method is used to fill the store before rendering the page
  // },
  head () {
    // Set Meta Tags for this Page
    return {
      title: 'Hello'// `Node: ${this.node.name}`
    }
  }
  // methods: {
  //   findNode: nodeId => {
  //     console.log(`findNode(${nodeId})`)
  //     let node = graph.findNode(nodeId)
  //     console.log('found Node', node)
  //     return node
  //   }
  // }
  // validate ({ params }) {
  //   // Must be a number
  //   console.log('validate params:', params)
  //   // return /^\d+$/.test(params.id)
  //   return true
  // }

}
</script>

<style scoped>

  .title
  {
    margin-top: 30px;
  }
  .info
  {
    font-weight: 300;
    color: #9aabb1;
    margin: 0;
    margin-top: 10px;
  }
  .button
  {
    margin-top: 30px;
  }

</style>
