<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered Node
          p.subtitle {{ node.key }}
        //- h1

        .content
          vis-hierarchy(v-bind:node="node")

          div
            .columns
              .column.has-text-centered
                h3 Is-used-by
                article(v-for="parentId in node.parents")
                  node-card(v-bind:node="index[parentId]")
                //- article
              //- column
              .column.has-text-centered(style="min-width: 0;")
                h3 Current node
                article
                  node-card(v-bind:node="node" show-data="true")
                //- article
              //- column
              .column.has-text-centered
                h3 Uses
                article(v-for="childId in node.children")
                  node-card(v-bind:node="index[childId]")
                //- article
              //- column
            //- columns
            hr
            h3 All
            article(v-for="item in list")
              router-link(v-bind:to="'/node/' + item.key") {{ item.key }}
            //- article
            nuxt-link(to="/" class="button") Home
            nuxt-link(to="/stuff" class="button") Stuff
          //- div
        //- content
      //- container
    //- section
  //- page
</template>
<script>
import NodeCard from '~/components/Card.vue'
import GraphClient from '~/lib/graphClient'
import VisHierarchy from '~/components/VisHierarchy'

export default {
  name: 'id',
  components: {
    NodeCard,
    VisHierarchy
  },
  // data: () => {
  //   return {
  //     nodeId: null
  //   }
  // },
  asyncData (context) {
    let region = context.params.region
    let nodeId = context.params.id
    return GraphClient(context.$axios, region, nodeId, false, context.error)
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
<style>

</style>
