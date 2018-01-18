<template lang="pug">
.page
  .container.has-text-centered
    //img(src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo")
    h1.title Node
    hr
    br
    hr
  .content
    h3 Virtual Private Clouds (VPCs)
    .columns
      .column.vpc(v-for="vpc in list" v-if="vpc.type == 'Virtual Private Cloud'")
        .top
          .card(style="min-width: 0%;")
            router-link(v-bind:to="'/' + $store.state.region + '/node/' + vpc.key") {{ vpc.key }}
            br
            | {{ vpc.id }}
            br
            //.name {{ label }}
            //.desc {{ description }}

            div(v-for="az in list" v-if="az.type == 'Availability Zone'")
              .card
                | Availability Zone ({{az.data.ZoneName}})
                br

                div(v-for="subnet in keysToNodesFilteredByType(vpc.children, 'Subnet')" v-if="subnetInAvailabilityZone(subnet, az)")
                  .card
                    | {{subnet.id}}
                    //br
                    //| {{subnet.data.AvailabilityZone}}
            //node-card(v-bind:node="vpc" id-as-label)
            //.column.vpc(v-for="vpcChild in list" v-if="node.type == 'Virtual Private Cloud'")
            //.subnet(v-for="vpcChild in vpc.children")
            //  | child {{vpcChild}}
            //  br
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
    return GraphClient(region, nodeId, false, context.error)
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
.card {
  border: solid 1px #666;
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 10px;
}
.container {
  //min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
  display: block;
  font-weight: 300;
  font-size: 42px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.vpc {
  max-width: 300px;
}

.links {
  padding-top: 15px;
}
</style>
