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
              a.navbar-item(href='/') Index
              a.navbar-item(href='/instance') Instances
              a.navbar-item(href='/cluster') Clusters
              a.navbar-item(href='/vpc') Networks
              a.navbar-item(href='/environment') Environment
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

export default {
  components: {
    MyFooter
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
</style>
