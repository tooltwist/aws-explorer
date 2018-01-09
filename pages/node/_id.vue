<template lang="pug">
  .page
    .container.has-text-centered
      //img(src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo")
      h1.title Node
      h2.info {{ node.key }}
      hr
      br

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
      hr

      h3 All
      ul
        li(v-for="item in list")
          router-link(v-bind:to="'/node/' + item.key") {{ item.key }}
      nuxt-link(to="/" class="button") Home
      nuxt-link(to="/stuff" class="button") Stuff
</template>

<script>
// import axios from '~/plugins/axios'
import NodeCard from '~/components/Card.vue'
import GraphClient from '~/lib/graphClient'

export default {
  name: 'id',
  components: {
    NodeCard
  },
  // data: () => {
  //   return {
  //     nodeId: null
  //   }
  // },
  asyncData (context) {
    // Hack. This page gets loaded when the map file for bulma is loaded.
    // We don't want to load data in this case.
    // if (context.params.id === 'bulma.css.map') {
    //   console.log('Ignoring asyncData (route for bulma.css.map)')
    //   return
    // }

    console.log('LOADING NODE ', context.params)

    return GraphClient(context.params.id, context.error)
  },
  // fetch () {
  //   // The `fetch` method is used to fill the store before rendering the page
  // },
  head () {
    // Set Meta Tags for this Page
    return {
      title: `Node: ${this.node.keys}`
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
