// See https://nuxtjs.org/guide/vuex-store/

import Vuex from 'vuex'

const createStore = () => {
  console.log('createStore()')
  return new Vuex.Store({
    state: {
      counter: 0
    },
    actions: {
      nuxtServerInit ({ commit }, { req }) {
        console.log('nuxtServerInit()')
        // if (req.session.user) {
        //   commit('user', req.session.user)
        // }
      }
    },
    mutations: {
      increment (state) {
        state.counter++
      }
    }
  })
}

export default createStore
