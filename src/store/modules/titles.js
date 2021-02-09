import titleServices from '@/services/titleServices'

export default {
  namespaced: true,
  state() {
    return {
      // customTitlesVisible: false,
      titles: [],
      // historyVisiblity: false,
      // titleHistory: [],
      // historyOwner: {}
    }
  },
  mutations: {
    // set_post_id: (state, id) => {
    //   state.postId = id;
    // },

    // set_titles_visibility: (state, visibility) => {
    //   state.customTitlesVisible = visibility;
    // },

    // populate_titles: (state, titles) => {
    //   state.titles = titles;
    // },

    // set_history_visibility: (state, visiblity) => {
    //   state.historyVisiblity = visiblity;
    // },

    // populate_title_history: (state, payload) => {

    //   state.titleHistory= payload.history;
    //   state.historyOwner = payload.author;
    // }
    populate_titles: (state, titles) => {

    }
  },
  actions: {

    getTitleMatches: (context, payload) => {
      return new Promise((resolve, reject) => {
        titleServices.getTitleHashMatches(payload)
        .then(response => {
          let candidateTitles = response.data;
          
          browser.tabs.query({ active: true, currentWindow: true })
          .then( tabs => {
            browser.tabs.sendMessage(tabs[0].id, { type: "find_and_replace_title",
            title: candidateTitles[0] })
            .then( (elArr) => {
           
              resolve(elArr)

            })
          })
          
          
        })
        .catch(err => {
          console.log(err)
          reject();
        })
      })
    },

    // setPostId: (context, payload) => {
    //   context.commit('set_post_id', payload);
    // },

    // fetchPostTitles: (context, payload) => {

    //   return new Promise((resolve, reject) => {

    //     let customTitleReqHeaders = {};

    //     if (payload.namespace == 'profileTitles') {
    //       let activityUserName = context.rootState['profileArticles/username'];
    //       customTitleReqHeaders = {
    //         activityusername: activityUserName
    //       };
    //     }

    //     postServices.getCustomTitlesOfPost({ postId: context.state.postId }, customTitleReqHeaders)
    //     .then(response => {
    //       context.dispatch('articleFilters/updateTitles', {
    //         postId: context.state.postId,
    //         titles: response.data
    //       }, { root: true });
    //       resolve();
    //     })
    //   })
    // },

    // setTitlesVisibility: (context, payload) => {
    //   context.commit('set_titles_visibility', payload);
    // },

    // populateTitles: (context, payload) => {
    //   context.commit('populate_titles', payload);
    // },

    // setHistoryVisibility: (context, payload) => {
    //   context.commit('set_history_visibility', payload);
    // },

    // populateTitleHistory: (context, payload) => {
    //   context.commit('populate_title_history', payload);
    // }

  }
}
