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

        /*
        when there's at least one alt title for the headline, titleId (the id of the associated
        StandaloneTitle) is not null and inside CustomTitles, this associated title which has a
        corresponding PostId is used to send/edit/delete titles.
        In the absence of any alt titles, titleId is null, and the two fields titleText (the exact
        text of the original heading) and titleElementId (a unique id given by content script to 
        the element containing the headline -- later used for fetching the element of and modifying the headline )
        */
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
            if (message.type == 'fetch_titles') {
                thisRef.setUpTitles()
                .then(() => {
                    console.log('titles set up')
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