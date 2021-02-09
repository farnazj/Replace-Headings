<template>
    <v-container fluid>
        <custom-toolbar></custom-toolbar>

        <p>
            This is the home page.
        </p>
    </v-container>
</template>

<script>
import customToolbar from '@/components/CustomToolbar'
import standaloneTitleHelpers from '@/mixins/standaloneTitleHelpers'
import utils from '@/services/utils'
import {mapActions} from 'vuex'

export default {
    components: {
        'custom-toolbar': customToolbar
    },
    data() {
        return {
        }
    },
    created() {
        browser.tabs.query({ active: true, currentWindow: true })
        .then( tabs => {
            browser.tabs.sendMessage(tabs[0].id, { type: "get_document_innertext" })
            .then( (response) => {

                let allHashes = this.hashPageContent(response);
                console.log(allHashes)
             
                this.getTitleMatches({ titlehashes: allHashes})
                .then(candidateTitles => {

                    let allProms = [];
                    candidateTitles.forEach((candidateTitle, index) => {

                        allProms.push(this.arrangeCustomTitles(candidateTitle.StandaloneCustomTitles)
                            .then(customTitleObjects => {
                                console.log(JSON.stringify(customTitleObjects), 'akhar')
                                candidateTitles[index].sortedCustomTitles = customTitleObjects.slice().sort(utils.compareTitles);
                            })
                        )
                        
                    })

                    Promise.all(allProms)
                    .then(() => {
                        this.findTitlesOnPage({candidateTitlesWSortedCustomTitles: candidateTitles})
                        .then(res => {

                        })
                    })
                
                })

            });
        });
    },
    methods: {
        ...mapActions('titles', [
            'getTitleMatches',
            'findTitlesOnPage'
        ])
    },
    mixins: [standaloneTitleHelpers]
}
</script>