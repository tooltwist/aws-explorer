<template lang="pug">
  .side-menu(v-bind:class="{'is-active': isActive}", data-title="aws-explorer")
    a.navbar-burger(role="button", aria-label="menu", aria-expanded="false", @click="toggleNavbar()", v-bind:class="{'is-active': isActive}")
      span(aria-hidden="true")
      span(aria-hidden="true")
      span(aria-hidden="true")
    //- a
    a.logo.is-hidden-touch(href='/')
      img(src='~assets/img/logo-twist-vue.png', alt='ToolTwist')
      span aws-explorer
    //- logo
    br.is-hidden-desktop
    .control
      .select
        b-icon(icon="near-me", size="is-small")
        select.my-region-select(v-model="selectedRegion" v-on:change="changeRegion")
          option(v-for="region in regions" v-if="region.public" v-bind:value="region.code")
            | {{region.code}} ({{region.name}})
          //- option
        //- select
      //- .select
    //- control
    aside.menu
      p.menu-label
        | Getting Started
      //- p
      ul.menu-list
        li
          a(v-bind:href="'/' + $store.state.region + '/allnodes'") All Nodes
        //- li
        //- li
        //-   a(v-bind:href="'/' + $store.state.region + '/cluster'") Clusters
        //- li
        li
          a(v-bind:href="'/' + $store.state.region + '/vpc'") VPCs
        //- li
        li
          a(v-bind:href="'/' + $store.state.region + '/graph'") Graph
        //- li
        li
          a(v-bind:href="'/' + $store.state.region + '/awslinks'") AWS Links
        //- li
        li
          a(v-bind:href="'/' + $store.state.region + '/help'") Help
        //- li
        li
          a(v-on:click="reload")
            | Reload
            b-icon(icon="autorenew", size="is-small")
          //- a
        //- li
      //- ul
    //- aside
  //- side-menu
</template>
<script>
import Regions from 'aws-regions'
import myAWS from '~/server/misc/myAWS'
var reloadCount = 1
var helpVisible = false
export default {
  data: function () {
    let regions = Regions.list()
    // let currentRegion = myAWS.region()
    return {
      regions: regions,
      selectedRegion: this.$route.params.region,
      isActive: false
    }
  },
  computed: {
    currentRegion: () => {
      let region = myAWS.region()
      if (region) {
        console.log('Current region is ' + region)
        return region
      }
      return 'ap-southeast-1'
      // return ''
    },
    helpVisible: function () {
      return helpVisible
    }
  },
  methods: {
    changeRegion: function () {
      let region = this.selectedRegion
      console.log(`Change region to ${region}`)
      this.$store.commit('setRegion', region)

      let path = `/${region}/`
      this.$router.push(path)
      return true
    },
    reload: function () {
      // Reload the current region's data
      let region = this.$store.state.region
      let path = `/${region}`
      console.log('Reload!')
      console.log('route to', path)
      this.$router.push({ path: path, query: { reload: true, s: reloadCount++ } })
      return true
    },
    toggleHelp: function () {
      console.log(`toggleHelp()`)

      helpVisible = !helpVisible
    },
    toggleNavbar () {
      this.isActive = !this.isActive
    }
  }
}
</script>
<style lang="scss">

</style>
