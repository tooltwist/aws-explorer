import axios from '~/plugins/axios'

export default function (region, nodeId, reload, error) {
  console.log(`graphClient(region=${region}, nodeId=${nodeId})`)

  let url = `/api/graph/${region}`
  if (reload) {
    url += '?reload=true'
  }
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
      console.log('Could not get graph data', e)
      error({ statusCode: 404, message: 'Graph not found' })
    })
}
