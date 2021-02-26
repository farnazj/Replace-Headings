module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],

  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.js',
      title: 'Popup'
    },
    devtools: {
      template: 'public/browser-extension.html',
      entry: './src/devtools/main.js',
      title: 'Devtools'
    }
  },

  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.js'
        },
        contentScripts: {
          entries: {
            'fuse': 'src/content-scripts/fuse.js',
            'helpers': 'src/content-scripts/helpers.js',
            'content-script': 'src/content-scripts/content-script.js'
          }
        }
      }
    }
  }
}
