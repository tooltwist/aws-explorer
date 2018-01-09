import axios from '~/plugins/axios'

export default function (nodeId, error) {
  // asyncData ({ params, error }) {
  // let params = context.params
  // let error = context.error
  // called every time before loading the component
  console.log('\n\n*** asyncData()\n*** nodeId: ', nodeId)
  // return axios.get('/api/users/0')
  // return axios.get('/api/graph/Load Balancer::ttcf-dcprd-alb-ch4dcprd')
  let region = 'ap-southeast-1'
  return axios.get('/api/graph/' + region)
    .then((res) => {
      // return { gnode: { id: 'Hello' } }
      // // console.log('Have graph data: ', res.data)
      // let node = res.data['Load Balancer::ttcf-dcprd-alb-ch4dcprd']
      let node = null
      if (nodeId) {
        node = res.data[nodeId]
      }
      // console.log('\n\nlode on node page:', node)
      // Create a list
      let list = [ ]
      for (var key in res.data) {
        list.push(res.data[key])
      }

      console.log('Returning nodes')
      return {
        node: node,
        index: res.data,
        list: list
      }
      // console.log('asyncData()', context.route.params.node)
      // return {
      //   nodeId: context.route.params.node,
      //   node: node
      // }
    })
    .catch((e) => {
      console.log('Could not get graph data', e)
      error({ statusCode: 404, message: 'Graph not found' })
    })
}
