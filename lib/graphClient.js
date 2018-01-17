import axios from '~/plugins/axios'

export default function (nodeId, error) {
  console.log(`graphClient(${nodeId})`)

  let region = 'ap-southeast-1'
  return axios.get('/api/graph/' + region)
    .then((res) => {
      let node = null
      if (nodeId) {
        node = res.data[nodeId]
      }
      let list = [ ]
      for (var key in res.data) {
        list.push(res.data[key])
      }

      // console.log('Returning nodes')
      return {
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
