<template lang="pug">
  .section
    header
      nav.navbar.is-light.is-fixed-top
        .container
          .navbar-brand
            a.navbar-item(href='/')
              img(src='../assets/img/favicon-green.png', alt='ToolTwist')
              | &nbsp;
              | aws-explorer
              //img(src='../assets/img/favicon-green.png', alt='ToolTwist')
              //| &nbsp;
              //| ToolTwist
            //- a
            .navbar-burger.burger(data-target='navTtTransparent')
              span
              span
              span
            //- navbar-burger
          //- navbar-brand
          #navTtTransparent.navbar-menu
            .navbar-start
            //- navbar-start

            .navbar-end
              a.navbar-item(v-bind:href="'/' + $store.state.region + '/'") Index
              a.navbar-item(v-bind:href="'/' + $store.state.region + '/instance'") Instances
              a.navbar-item(v-bind:href="'/' + $store.state.region + '/cluster'") Clusters
              a.navbar-item(v-bind:href="'/' + $store.state.region + '/vpc'") Networks
              a.navbar-item(v-bind:href="'/' + $store.state.region + '/environment'") Environment
              a.navbar-item(v-bind:href="'/' + $store.state.region + '/graph'") Graph
              a.navbar-item(v-bind:href="'/' + $store.state.region + '/awslinks'") AWS Links
              a.navbar-item(v-bind:href="'/' + $store.state.region + '/help'") Help
              a.navbar-item(v-on:click="reload")
                span.icon
                  i.fas.fa-home
                | reload
                //.icon.is-small.fas.fa-redo
              .navbar-item
                div.field
                  //label.label Region
                  .control
                    .select
                      select.my-region-select(v-model="selectedRegion" v-on:change="changeRegion")
                        option(v-for="region in regions" v-if="region.public" v-bind:value="region.code")
                          | {{region.code}} ({{region.name}})
              //- a
            //- navbar-end
          //- navbar-menu
        //- container
      //- nav
    //- header

    .container
      nuxt
    my-footer
</template>

<script>
import MyFooter from '~/components/Footer.vue'
import Regions from 'aws-regions'
import myAWS from '~/server/misc/myAWS'

var reloadCount = 1

export default {
  components: {
    MyFooter
  },
  data: function () {
    let regions = Regions.list()
    // let currentRegion = myAWS.region()
    return {
      regions: regions,
      selectedRegion: this.$route.params.region
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
    }
  }
}
</script>

<style>
/* .container
{
  margin: 0;
  width: 100%;
  padding: 100px 0;
  text-align: center;
} */

/*
.button, .button:visited
{
  display: inline-block;
  color: black;
  letter-spacing: 1px;
  background-color: #fff;
  border: 2px solid #000;
  text-decoration: none;
  text-transform: uppercase;
  padding: 15px 45px;
}

.button:hover, .button:focus
{
  color: #fff;
  background-color: #000;
}

.title
{
  color: #000;
  font-weight: 300;
  font-size: 2.5em;
  margin: 0;
}

.cc {
  background-color: yellow;
}
*/

.my-region-select {
  margin-top: 5px;
  font-size: 13px !important;
  //color: red !important;
  width: 210px;
}

</style>
