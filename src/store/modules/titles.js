import titleServices from '@/services/titleServices'
import utils from '@/services/utils'

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

    // set_history_visibility: (state, visiblity) => {
    //   state.historyVisiblity = visiblity;
    // },

    // populate_title_history: (state, payload) => {

    //   state.titleHistory= payload.history;
    //   state.historyOwner = payload.author;
    // }

    populate_titles: (state, titles) => {
      state.titles = titles;
    }
  },
  actions: {

    getTitleMatches: (context, payload) => {
      return new Promise((resolve, reject) => {
        titleServices.getTitleHashMatches(payload)
        .then(response => {
          let candidateTitles = response.data;
          resolve(candidateTitles);
        })
        .catch(err => {
          console.log(err)
          reject();
        })
      })
    },

    findTitlesOnPage: (context, payload) => {
      return new Promise((resolve, reject) => {

        let candidateTitles = payload.candidateTitlesWSortedCustomTitles;
        candidateTitles.forEach(candidateTitle => {
          candidateTitle.uncurlifiedFullText = utils.uncurlify(candidateTitle.text);
        })
        
        browser.tabs.query({ active: true, currentWindow: true })
        .then( tabs => {

          let allProms = [];
          let titlesFoundOnPage = [];
          candidateTitles.forEach(candidateTitle => {

            allProms.push(
              browser.tabs.sendMessage(tabs[0].id, { type: "find_and_replace_title",
              title: candidateTitle })
              .then( (replacementCount) => {
                if (replacementCount)
                  titlesFoundOnPage.push(candidateTitle);
              })
            )
            
          })

          Promise.all(allProms)
          .then(() => {
            context.commit('populate_titles', titlesFoundOnPage); 
            resolve();
          })

        })

      })
    }
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
