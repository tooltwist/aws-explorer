// import * as axios from 'axios'

// console.log(`Initializing axios in it's plugin`)
// let options = {}
// // The server-side needs a full url to works
// if (process.server) {
//   options.baseURL = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3001}`
// }

// console.log(`options isz:`, options)
// export default axios.create(options)
// import juice from '@tooltwist/juice-client'



/*
 *  Extend @nuxtjs/axios module.
 *  See https://axios.nuxtjs.org/extend.html
 */


export default function ({ $axios, redirect }) {
  console.log(`axios plugin initialisation...`)

  // console.log(`  API_URL_BROWSER=${process.env.API_URL_BROWSER}`)
  // console.log(`  API_URL=${process.env.API_URL}`)

  $axios.onRequest(config => {
    console.log('Making request to ' + config)
    console.log('Making request to ' + config.url)
  })

  // console.log(`process.client=${process.client}`)
  // console.log(`process.server=${process.server}`)
  // console.log(`process.static=${process.static}`)
  let url
  if (process.client) {
    // Client-side access to server
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const port = window.location.port
    url = `${protocol}//${hostname}:${port}`
    console.log(`Client will use API endpoint from browser: ${url}`)
    $axios.defaults.baseURL = url
  } else {
    // Server-side access to server (used during SSR)
    const protocol = `http:`
    const hostname = `127.0.0.1`
    const port = process.env.PORT | 4000
    url = `${protocol}//${hostname}:${port}`
    console.log(`Client will use API endpoint from server: ${url}`)
    $axios.defaults.baseURL = url
  }
  // $axios.setBaseURL(url)

  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status)
    if (code === 400) {
      redirect('/400')
    }
  })

    // // Create a custom axios instance
    // const api = $axios.create({
    //   headers: {
    //     common: {
    //       Accept: 'text/plain, */*'
    //     }
    //   }
    // })
  
    // // Set baseURL to something different
    // const PORT = process.env.PORT || 3000
    // const baseUrl = await juice.string('endpoint', `localhost:${PORT}`)
    // console.log(`axios baseURL is ${baseUrl}`)
    // api.setBaseURL(baseUrl)
  
    // Inject to context as $api
    // inject('api', api)
  
}
