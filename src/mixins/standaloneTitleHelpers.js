import utils from '@/services/utils'
import consts from '@/services/constants'
import sourceServices from '@/services/sourceServices'
import titleServices from '@/services/titleServices'
import { mapState, mapActions } from 'vuex'

export default {

  data: () => {
    return {
      // titleObjects: []
    }
  },
  computed: {
    // sortedTitles: function() {
    //   return this.titleObjects.slice().sort(utils.compareTitles);
    // },
    // titles: function() {
    //   return this.state.titles;
    // },
    // postId: function() {
    //   return this.state.postId;
    // },
    // customTitlesVisible: function() {
    //   return this.state.customTitlesVisible;
    // },
    // ...mapState({
    //    state (state) {
    //      return state[this.titlesNamespace];
    //    }
    // })
  },
  methods: {

    // hashPageContent: function(content) {
      
    //   let allHashes = [];
    //   let contentArr = content.split(/\r\n|\r|\n|\t/);
    //   contentArr.forEach( (str) => {
    //     if (str.length >= consts.LENGTH_TO_HASH) {
    //       for (let i = 0 ; i < str.length ; i++) {
    //         let strPortion = str.substr(i, consts.LENGTH_TO_HASH);
    //         if (strPortion.length >= consts.LENGTH_TO_HASH) {
    //           allHashes.push(utils.hashCode(utils.uncurlify(strPortion)));
    //         }
            
    //       }
    //     }
          
    //   })

    //   return allHashes;
    // },
  

    // arrangeCustomTitles: function(resTitles) {

    //   let titleObjects = [];
    //   let titlesBySetId = {};

    //   console.log('in mixin', resTitles)
    //   if (resTitles) {
    //     resTitles.forEach(title => {

    //       if (!(title.setId in titlesBySetId )) {
    //           let titleObj = {};
    //           titleObj['history'] = [];
    //           titlesBySetId[title.setId] = titleObj;
    //       }

    //       if (title.version != 1) {
    //         titlesBySetId[title.setId]['history'].push(title);
    //       }
    //       else {
    //         titlesBySetId[title.setId]['lastVersion'] = title;
    //       }
    //     })

    //     let allProms = [] ;
    //     for (const [setId, titleObj] of Object.entries(titlesBySetId)) {
    //       let titlesetProms = [
    //         sourceServices.getSourceById(titleObj['lastVersion'].SourceId),
    //         titleServices.hasUserEndorsedTitle({ setId: setId })
    //       ];

    //       allProms.push(Promise.all(titlesetProms)
    //       .then(resp => {
    //         titlesBySetId[setId]['author'] = resp[0].data;
    //         titlesBySetId[setId]['userEndorsed'] = resp[1].data;
    //         titleObjects.push(titlesBySetId[setId]);
    //       }))

    //     }
    //     return Promise.all(allProms)
    //     .then(() => {
    //       console.log(titleObjects, 'in mixin')

    //       return Promise.resolve(titleObjects);
    //     });
    //   }
   
    // },
    // getTitleMatches: (context, payload) => {
    //   return new Promise((resolve, reject) => {
    //     titleServices.getTitleHashMatches(payload)
    //     .then(response => {
    //       let candidateTitles = response.data;
    //       resolve(candidateTitles);
    //     })
    //     .catch(err => {
    //       console.log(err)
    //       reject();
    //     })
    //   })
    // },

    // findTitlesOnPage: (context, payload) => {
    //   return new Promise((resolve, reject) => {

    //     let candidateTitles = payload.candidateTitlesWSortedCustomTitles;
    //     candidateTitles.forEach(candidateTitle => {
    //       candidateTitle.uncurlifiedFullText = utils.uncurlify(candidateTitle.text);
    //     })
        
    //     browser.tabs.query({ active: true, currentWindow: true })
    //     .then( tabs => {

    //       let allProms = [];
    //       let titlesFoundOnPage = [];
    //       candidateTitles.forEach(candidateTitle => {

    //         allProms.push(
    //           browser.tabs.sendMessage(tabs[0].id, { type: "find_and_replace_title",
    //           title: candidateTitle })
    //           .then( (replacementCount) => {
    //             if (replacementCount)
    //               titlesFoundOnPage.push(candidateTitle);
    //           })
    //         )
            
    //       })

    //       Promise.all(allProms)
    //       .then(() => {
    //         context.commit('populate_titles', titlesFoundOnPage); 
    //         resolve();
    //       })

    //     })

    //   })
    // },

    // ...mapActions({
    //   setPostId(dispatch, payload) {
    //     return dispatch(this.titlesNamespace + '/setPostId', payload)
    //   },
    //   populateTitles(dispatch, payload) {
    //     return dispatch(this.titlesNamespace + '/populateTitles', payload)
    //   },
    //   setTitlesVisibility(dispatch, payload) {
    //     return dispatch(this.titlesNamespace + '/setTitlesVisibility', payload)
    //   }
    // })

  }

}
