export default {
  namespaced: true,
  state: {
    url: null
  },
  mutations: {
    set_url: (state, url) => {
      state.url = url;
    }
  },
  actions: {
    setUpPageUrl: function(context) {

      return new Promise((resolve, reject) => {

        browser.tabs.query({ active: true, currentWindow: true })
        .then( tabs => {
            browser.tabs.sendMessage(tabs[0].id, { type: "get_page_url" })
            .then(pageUrl => {
                context.commit('set_url', pageUrl);
                resolve;
            })
        })
        .catch(err => {
            reject(err);
        })
      })
    }

  }
}
