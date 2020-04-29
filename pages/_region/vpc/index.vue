<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h3.title.is-3.has-text-centered Node
          //- p.subtitle -
        //- h1

        .content
          h3 Virtual Private Clouds (VPCs)
          .columns
            .column(v-for="vpc in list" v-if="vpc.type == 'Virtual Private Cloud'")
              .vpc
                .card
                  .card-content(style="min-width: 0%;")
                    router-link(v-bind:to="'/' + $store.state.region + '/node/' + vpc.key")
                      | {{ vpc.key }}
                    //- router-link
                    br
                    | {{ vpc.id }}
                    br
                    div(v-for="az in list" v-if="az.type == 'Availability Zone'")
                      .message
                        .message-body
                          | Availability Zone ({{az.data.ZoneName}})
                          br

                          div(v-for="subnet in keysToNodesFilteredByType(vpc.children, 'Subnet')" v-if="subnetInAvailabilityZone(subnet, az)")
                            .tag.is-dark
                              | {{subnet.id}}
                            //- tag
                          //- div
                        //- message-body
                      //- message
                    //- div
                  //- card-content
                //- card
              //- vpc
            //- column
          //- columns
        //- content
      //- container
    //- section
  //- page
</template>
<script>
import NodeCard from '~/components/Card.vue'
// import Logo from '~/components/Logo.vue'
import GraphClient from '~/lib/graphClient.js'

export default {
  components: {
    NodeCard
  },
  asyncData (context) {
    let region = context.params.region
    let nodeId = null
    context.store.commit('setRegion', region)
    return GraphClient(context.$axios, region, nodeId, false, context.error)
  },
  fetch () {
    // The `fetch` method is used to fill the store before rendering the page
  },
  head () {
    // Set Meta Tags for this Page
  },
  methods: {
    keysToNodesFilteredByType: function (keys, type) {
      // keys is array is keys
      // console.log('index type=' + typeof (this.index))
      let theNodeIndex = this.index

      // console.log(`keysToNodesFilteredByType(${keys}, ${type})`)
      let list = [ ] // Array of child nodes
      keys.forEach(function (key) {
        // console.log(`- key=${key}`)
        let child = theNodeIndex[key]
        // console.log(`---> `, child)
        if (!type || child.type === type) {
          list.push(child)
        }
      })
      console.log(`RETURNING ${list.length} CHILD RECORDS`)
      return list
    },
    subnetInAvailabilityZone: function (subnetNode, azNode) {
      console.log('azNode=', azNode.id)
      console.log('subnetNode=', subnetNode.data)
      return subnetNode.data.AvailabilityZone === azNode.id
    }
  },
  validate ({ params }) {
    // Must be a number
    console.log('validate params:', params)
    // return /^\d+$/.test(params.id)
    return true
  }

}
</script>
<style>

</style>
