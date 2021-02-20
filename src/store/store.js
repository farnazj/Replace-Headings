import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import relatedSources from './modules/relatedSources'
import sourceLists from './modules/sourceLists'
import titles from './modules/titles'
import pageDetails from './modules/pageDetails'

Vue.use(Vuex)

let store = new Vuex.Store({
  state: {

  },
  getters: {

  },
  mutations: {

  },
  actions: {

  },
  modules: {
    auth,
    relatedSources,
    sourceLists,
    titles,
    pageDetails
  }
})


export default store;
