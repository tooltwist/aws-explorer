<template lang="pug">
  .page
    .container.has-text-centered
      //img(src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo")
      h1.title {{ node.key }}
      hr
      br

    .container
      .columns
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
import axios from '~/plugins/axios'
import NodeCard from '~/components/Card.vue'

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
    if (context.params.id === 'bulma.css.map') {
      console.log('Ignoring asyncData (route for bulma.css.map)')
      return
    }
    // asyncData ({ params, error }) {
    let params = context.params
    let error = context.error
    // called every time before loading the component
    console.log('\n\n*** asyncData() 2\n*** Context: ', context)
    // return axios.get('/api/users/0')
    // return axios.get('/api/graph/Load Balancer::ttcf-dcprd-alb-ch4dcprd')
    let region = 'ap-southeast-1'
    return axios.get('/api/graph/' + region)
      .then((res) => {
        // return { gnode: { id: 'Hello' } }
        // // console.log('Have graph data: ', res.data)
        // let node = res.data['Load Balancer::ttcf-dcprd-alb-ch4dcprd']
        let node = res.data[params.id]
        // console.log('\n\nlode on node page:', node)
        // Create a list
        let list = [ ]
        for (var key in res.data) {
          list.push(res.data[key])
        }

        return { node: node, index: res.data, list: list }
        // console.log('asyncData()', context.route.params.node)
        // return {
        //   nodeId: context.route.params.node,
        //   node: node
        // }
      })
      .catch((e) => {
        console.log('Could not get graph data', e)
        error({ statusCode: 404, message: 'Graph not found' })
      })
  },
  // fetch () {
  //   // The `fetch` method is used to fill the store before rendering the page
  // },
  head () {
    // Set Meta Tags for this Page
    return {
      title: `Node: ${this.node.name}`
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
