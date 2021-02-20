<template>
    <v-container fluid>
        <custom-toolbar></custom-toolbar>
    </v-container>
</template>

<script>
import customToolbar from '@/components/CustomToolbar'
import standaloneTitleHelpers from '@/mixins/standaloneTitleHelpers'
import { mapState, mapActions } from 'vuex'

export default {
    components: {
        'custom-toolbar': customToolbar
    },
    data() {
        return {
        }
    },
    created() {

        let thisRef = this;

        browser.tabs.query({ active: true, currentWindow: true })
        .then( tabs => {
            browser.tabs.sendMessage(tabs[0].id, { type: 'close_sidebar' });
            console.log(this.url, 'avalesh url')
            if (!this.url)
            {
                browser.tabs.sendMessage(tabs[0].id, { type: 'get_page_url' })    
                .then(pageUrl => {
                    console.log('page url', pageUrl)
                    this.setUpPageUrl(pageUrl);
                })
            }

        })

        browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            console.log(message)
            if (message.type == 'direct_to_custom_titles') {
                console.log(message.data)
                thisRef.setTitlesDialogVisibility(true)
                .then(() => {
                    console.log('going to redirect to customtitles')
                    thisRef.$router.push({ name: 'customTitles',  
                        params: { 
                            titleId: message.data.titleId,
                            titleText: message.data.titleText,
                            titleElementId: message.data.titleElementId
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    })
                })
            }
        });
    
  
        

    if (!this.titles.length && !this.titlesFetched ) {
        this.setUpTitles()
        .then( () => {
            this.setTitlesFetched(true);
        })
    }
        

    },
    computed: {
        ...mapState('titles', [
            'titles',
            'titlesFetched'
        ]),
        ...mapState('pageDetails', [
            'url'
        ])
    },
    methods: {
        ...mapActions('titles', [
            'setUpTitles',
            'setTitlesDialogVisibility',
            'setTitlesFetched'
        ]),
        ...mapActions('pageDetails', [
            'setUpPageUrl'
        ])
    },
    mixins: [standaloneTitleHelpers]
}
</script>