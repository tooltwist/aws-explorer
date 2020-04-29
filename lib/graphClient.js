// import axios from '~/plugins/axios'

export default function (axios, region, nodeId, reload, error) {
  // console.log(`graphClient(region=${region}, nodeId=${nodeId})`)

  // const endpoint = `http://localhost:3001`
  const endpoint = ''

  let url = `${endpoint}/api/graph/${region}`
  if (reload) {
    url += '?reload=true'
  }

console.log(`Calling my server (${url})`)

  return axios.get(url)
    .then((res) => {
      let node = null
      if (nodeId) {
        node = res.data[nodeId]
      }
      let list = [ ]
      for (var key in res.data) {
        list.push(res.data[key])
      }

      // store.commit('setRegionData', { node, index: res.data, list })

      // console.log('Returning nodes')
      return {
        region: region,
        node: node,
        index: res.data,
        list: list
      }
    })
    .catch((e) => {
      console.log('Could not get graph data')
      console.log(e)
      console.log(`errno=${e.errno}`)
      console.log(`code=${e.code}`)
      console.log(`url=${e.config.baseURL}${e.config.url}`)

      error({ statusCode: 404, message: 'Graph not found' })
    })
}
