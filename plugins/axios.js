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

  if (process.client) {
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const port = window.location.port
    const url = `${protocol}//${hostname}:${port}`
    console.log(`Setting API endpoint on browser to ${url}`)
    $axios.defaults.baseURL = url
  } else {
    const protocol = `http:`
    const hostname = `127.0.0.1`
    // const port = process.env.PORT | 3000
    const port = 4000
    const url = `${protocol}//${hostname}:${port}`
    console.log(`Setting API endpoint on server to ${url}`)
    $axios.defaults.baseURL = url
  }

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