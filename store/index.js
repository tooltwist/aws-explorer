export const state = () => ({
  // counter: 0,
  region: 'ap-southeast-1',
  // regionData: { node: null, index: [ ], list: [ ] }
  node: null,
  index: [ ],
  list: [ ]
})

export const mutations = {
  // increment (state) {
  //   state.counter++
  // },
  setRegion (state, region) {
    console.log(`Mutation: Set region to ${region}`)
    state.region = region
  },
  setRegionData (state, regionData) {
    console.log(`Mutation: Set region data`)
    state.node = regionData.node
    state.index = regionData.index
    state.list = regionData.list
  }
}

export const actions = {
  nuxtServerInit ({ commit }, { req }) {
    // console.log('nuxtServerInit()')
    // let nodeId = 'abc'
    // let promise = GraphClient(nodeId, (e) => {
    //   console.log('Immediate error from GraphClient', e)
    // })
    //
    // promise.then((res) => {
    //   console.log('Have data back from GraphClient')
    //   commit('setRegionData', res)
    // }).catch((e) => {
    //   console.log('Error from GraphClient', e)
    // })
    // if (req.session.user) {
    //   commit('user', req.session.user)
    // }
  }
}
