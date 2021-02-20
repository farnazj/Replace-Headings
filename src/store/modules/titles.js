import titleServices from '@/services/titleServices'
import sourceServices from '@/services/sourceServices'
import utils from '@/services/utils'
import consts from '@/services/constants'
import Vue from 'vue'

export default {
  namespaced: true,
  state() {
    return {
      titles: [],
      titlesDialogVisible: false,
      historyVisiblity: false,
      titleHistory: [],
      historyOwner: {},
      titlesFetched: false
    }
  },
  mutations: {

    set_titles_dialog_visibility: (state, visibility) => {
      state.titlesDialogVisible = visibility;
    },

    set_history_visibility: (state, visiblity) => {
      state.historyVisiblity = visiblity;
    },

    // populate_title_history: (state, payload) => {

    //   state.titleHistory= payload.history;
    //   state.historyOwner = payload.author;
    // }

    populate_titles: (state, titles) => {
      let replaceMode = false;
      if (titles.length == 1) {
        
        let index = state.titles.findIndex(title => title.id == titles[0].id);
        if (index !== -1 ) {
          Vue.set(state.titles, index, titles[0]);
          replaceMode = true;
        }
      }
      
      if (!replaceMode)
        state.titles.push(...titles);
    },

    remove_from_titles: (state, titleToDelete) => {
      let index = state.titles.findIndex(title => title.id == titleToDelete.id);
      state.titles.splice(index, 1);
    },

    set_titles_fetched_status: (state, payload) => {
      state.titlesFetched = payload;
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
            resolve(titleObjects);
          });
        }
      })
   
    },
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
              .then(replacementCount => {
                if (replacementCount)
                  titlesFoundOnPage.push(candidateTitle);
              })
            )
          })

          console.log(titlesFoundOnPage, 'titles found on page')
          Promise.all(allProms)
          .then(() => {
            context.commit('populate_titles', titlesFoundOnPage);
            if (!titlesFoundOnPage.length) {
              browser.tabs.sendMessage(tabs[0].id, { type: 'identify_potential_titles' })
              .then(() => {
                resolve();  
              })
            }
            else
              resolve();
            
          })

        })

      })
    },

    removeTitleFromPage: (context, payload) => {
      return new Promise((resolve, reject) => {
        browser.tabs.query({ active: true, currentWindow: true })
        .then( tabs => {

          browser.tabs.sendMessage(tabs[0].id, { type: "find_and_replace_title",
            title: payload.title,
            remove: true
          })
          .then(replacementCount => {
            context.commit('remove_from_titles', payload.title)
            resolve();
          })
        })
      })

    },

    sortCustomTitles: (context, payload) => {
      return new Promise((resolve, reject) => {
        
        let standaloneTitlesArr = payload;
        let allProms = [];

        standaloneTitlesArr.forEach((candidateTitle, index) => {
          if (typeof candidateTitle.StandaloneCustomTitles !== 'undefined') {
            allProms.push(context.dispatch('arrangeCustomTitles', { resTitles: candidateTitle.StandaloneCustomTitles })
            .then(customTitleObjects => {
              standaloneTitlesArr[index].sortedCustomTitles = customTitleObjects.slice().sort(utils.compareTitles);
            }))
          }
        })

        if (allProms.length) {
          Promise.all(allProms)
          .then(() => {
              resolve(standaloneTitlesArr);
          })
        }
        else
          resolve([]);
        
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
                    context.dispatch('sortCustomTitles', candidateTitles)
                    .then(standaloneTitlesArr => {
                      context.dispatch('findTitlesOnPage', { candidateTitlesWSortedCustomTitles: standaloneTitlesArr })
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

    setTitlesDialogVisibility: (context, payload) => {
      return new Promise((resolve, reject) => {
        context.commit('set_titles_dialog_visibility', payload);
        resolve();
      })
    },

    /*
    This function is called from the CustomTitles view and adds the newly created custom
    title to the page (for a headline that did not have custom titles before).
    or to post an edit. It requests the full StandaloneTitle with its associated CustomTitle 
    and CustomTitle Endorsers from the server using the title hash, and adds them to the page. 
    */
    addTitleToPage: (context, payload) => {

      return new Promise((resolve, reject) => {

        let prom = Promise.resolve();
        if (payload.titleElementId) {
          prom = browser.tabs.query({ active: true, currentWindow: true })
            .then( tabs => {
            browser.tabs.sendMessage(tabs[0].id, { 
              type: "remove_event_listener_from_title",
              data: { headlineId: payload.titleElementId }
            })
          })
        }
        
        context.dispatch('getTitleMatches', { titlehashes: [payload.hash] })
        .then(candidateTitles => {
          context.dispatch('sortCustomTitles', candidateTitles)
            .then(standaloneTitlesArr => {
              context.dispatch('findTitlesOnPage', { 
                candidateTitlesWSortedCustomTitles: standaloneTitlesArr
              })
              .then(res => {
                prom.then(() => {
                  resolve()
                });
              })
            })
            
        })

      })
    },

    modifyCustomTitleInPage: (context, payload) => {
      return new Promise((resolve, reject) => {

        let activityUserName = context.rootGetters['auth/user'].userName;
        let customTitleReqHeaders = {
          activityusername: activityUserName
        };
      
        titleServices.getCustomTitlesOfPost({ postId: payload.postId },
           customTitleReqHeaders)
        
        .then(res => {
          let candidateTitle = res.data; //an instance of StandaloneTitle
          context.dispatch('sortCustomTitles', [candidateTitle])
          .then(standaloneTitlesArr => {

            if (standaloneTitlesArr.length) {
              context.dispatch('findTitlesOnPage', { 
                candidateTitlesWSortedCustomTitles: standaloneTitlesArr
              })
              .then(res => {
                resolve()
              })
            }
            else {
              let titleToRemove = context.state.titles.find(title => title.PostId == payload.postId);
              context.dispatch('removeTitleFromPage', {
                title: titleToRemove
              })
              .then(() => {
                resolve()
              })
            }
            
          })
          
        })

      })
    },

    setHistoryVisibility: (context, payload) => {
      return new Promise((resolve, reject) => {
        context.commit('set_history_visibility', payload);
        resolve();
      })
    },

    setTitlesFetched: (context, payload) => {
      return new Promise((resolve, reject) => {
        context.commit('set_titles_fetched_status', payload);
        resolve();
      })
    }

    // populateTitleHistory: (context, payload) => {
    //   context.commit('populate_title_history', payload);
    // }

  }
}
