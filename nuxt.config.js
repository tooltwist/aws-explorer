module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'starter',
    meta: [
      { charset: 'utf-8' },
      {'http-equiv': 'X-UA-Compatible', content: 'IE=edge'},// From https://github.com/nuxt/nuxt.js/issues/1395
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js project' }
    ],
    css: [
      // '~/node_modules/bulma/css/bulma.css'
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Lato|Open+Sans' }
    ],
    build: {
      extractCSS: true
    }
  },
  /*
  ** Global CSS
  */
  css: [
    '~/assets/css/main.scss',
    '~/node_modules/vis/dist/vis-network.min.css',
  ],
  loading: {
    color: '#41b883'
  },
  /*
  ** Add axios globally
  */
  build: {
    vendor: ['axios', 'vis', 'lodash'],
    /*
    ** Run ESLINT on save
    */
    extend (config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    },
    postcss: {
       plugins: {
         'postcss-custom-properties': false
       }
     }
  },
  modules: [
    // '@nuxtjs/bulma'
    'nuxt-buefy'
  ]
}
