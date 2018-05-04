<template lang="pug">
  .page
    section.section
      .container.is-fluid
        h1.title.is-1.has-text-centered.has-text-grey-light
          img(src='~assets/img/logo-twist-vue.png', alt='ToolTwist')
          br
          span.is-uppercase Aws Explorer
        //- h1
        .field.is-grouped.is-centered
          p.control
            a.button.is-primary.is-large Get Started
          //- p
          p.control
            a.button.is-light.is-large GitHub
          //- p
        //- field
        hr
        br
        h3.title.is-3.has-text-dark.has-text-centered Contributors
        br
        .columns.developers
          .column.is-4.is-offset-2
            article.media
              figure.media-left
                p.image.is-64x64
                  img(src='~assets/img/img-phil.png', alt='ToolTwist')
              //- figure
              .media-content
                .content
                  p
                  p
                    strong Phil Callender
                  //- p
                //- content
              //- media-content
            //- article
            p Velit ubi cernantur id quorum hic quis cohaerescant voluptate illum deserunt, ab in coniunctione eu consequat fore ab expetendis consectetur, non ullamco reprehenderit, eiusmod illustriora est offendit, doctrina magna possumus arbitror ab aute relinqueret incididunt labore mandaremus. Noster si appellat qui esse ubi quid aut litteris ut fore.
          //- column
          .column.is-4
            article.media
              figure.media-left
                p.image.is-64x64
                  img(src='~assets/img/img-kelvin.jpg', alt='ToolTwist')
              //- figure
              .media-content
                .content
                  p
                  p
                    strong Kelvin Santos
                  //- p
                //- content
              //- media-content
            //- article
            p Velit ubi cernantur id quorum hic quis cohaerescant voluptate illum deserunt, ab in coniunctione eu consequat fore ab expetendis consectetur, non ullamco reprehenderit, eiusmod illustriora est offendit, doctrina magna possumus arbitror ab aute relinqueret incididunt labore mandaremus. Noster si appellat qui esse ubi quid aut litteris ut fore.
          //- column
        //- columns
      //- container
    //- section
  //- page
</template>
<script>

export default {
  components: {
  },
  async asyncData (context) {

  },
  methods: {

  },
  head () {
    return {
      title: 'Home'
    }
  },
  created () {

  }
}
</script>
<style>

</style>
