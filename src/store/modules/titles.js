import titleServices from '@/services/titleServices'
import sourceServices from '@/services/sourceServices'
import utils from '@/services/utils'
import consts from '@/services/constants'

export default {
  namespaced: true,
  state() {
    return {
      // customTitlesVisible: false,
      titles: [],
      historyVisiblity: false,
      titleHistory: [],
      historyOwner: {}
    }
  },
  mutations: {
    // set_post_id: (state, id) => {
    //   state.postId = id;
    // },

    // set_titles_visibility: (state, visibility) => {
    //   state.customTitlesVisible = visibility;
    // },

    set_history_visibility: (state, visiblity) => {
      state.historyVisiblity = visiblity;
    },

    // populate_title_history: (state, payload) => {

    //   state.titleHistory= payload.history;
    //   state.historyOwner = payload.author;
    // }

    populate_titles: (state, titles) => {
      state.titles = titles;
    }
  },
  actions: {

    hashPageContent: (context, payload) => {
      return new Promise((resolve, reject) => {
      
      let content = payload.content;
      let allHashes = [];
      let contentArr = content.split(/\r\n|\r|\n|\t/);
      contentArr.forEach( (str) => {
        if (str.length >= consts.LENGTH_TO_HASH) {
          for (let i = 0 ; i < str.length ; i++) {
            let strPortion = str.substr(i, consts.LENGTH_TO_HASH);
            if (strPortion.length >= consts.LENGTH_TO_HASH) {
              allHashes.push(utils.hashCode(utils.uncurlify(strPortion)));
            }
            
          }
        }
          
      })

      console.log(allHashes)
      resolve(allHashes);
    })
    },
  

    arrangeCustomTitles: (context, payload) => {
      return new Promise((resolve, reject) => {

        let resTitles = payload.resTitles;
        let titleObjects = [];
        let titlesBySetId = {};

        if (resTitles) {
          resTitles.forEach(title => {

            if (!(title.setId in titlesBySetId )) {
                let titleObj = {};
                titleObj['history'] = [];
                titlesBySetId[title.setId] = titleObj;
            }

            if (title.version != 1) {
              titlesBySetId[title.setId]['history'].push(title);
            }
            else {
              titlesBySetId[title.setId]['lastVersion'] = title;
            }
          })

          let allProms = [] ;
          for (const [setId, titleObj] of Object.entries(titlesBySetId)) {
            let titlesetProms = [
              sourceServices.getSourceById(titleObj['lastVersion'].SourceId),
              titleServices.hasUserEndorsedTitle({ setId: setId })
            ];

            allProms.push(Promise.all(titlesetProms)
            .then(resp => {
              titlesBySetId[setId]['author'] = resp[0].data;
              titlesBySetId[setId]['userEndorsed'] = resp[1].data;
              titleObjects.push(titlesBySetId[setId]);
            }))

          }
          Promise.all(allProms)
          .then(() => {
            console.log(titleObjects, 'in mixin')

            resolve(titleObjects);
          });
        }
      })
   
    },
    getTitleMatches: (context, payload) => {
      return new Promise((resolve, reject) => {
        console.log('payload', payload)
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
    },

    setUpTitles: (context, payload) => {
      return new Promise((resolve, reject) => {
        browser.tabs.query({ active: true, currentWindow: true })
        .then( tabs => {
            browser.tabs.sendMessage(tabs[0].id, { type: "get_document_innertext" })
            .then( (response) => {

                context.dispatch('hashPageContent', {content: response})
                .then( allHashes => {
                  context.dispatch('getTitleMatches', { titlehashes: allHashes })
                  .then(candidateTitles => {
                    
                      let allProms = [];
                      candidateTitles.forEach((candidateTitle, index) => {
  
                          allProms.push(context.dispatch('arrangeCustomTitles', {resTitles: candidateTitle.StandaloneCustomTitles})
                          .then(customTitleObjects => {
                              candidateTitles[index].sortedCustomTitles = customTitleObjects.slice().sort(utils.compareTitles);
                          }))
                          
                      })
  
                      Promise.all(allProms)
                      .then(() => {
                          context.dispatch('findTitlesOnPage', {candidateTitlesWSortedCustomTitles: candidateTitles})
                          .then(res => {
                            resolve();
                          })
                      })
                  
                  })
                })
             
         

            });
        });
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

    setHistoryVisibility: (context, payload) => {
      context.commit('set_history_visibility', payload);
    },

    // populateTitleHistory: (context, payload) => {
    //   context.commit('populate_title_history', payload);
    // }

  }
}
