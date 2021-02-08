<template>
    <v-container fluid>
        <custom-toolbar></custom-toolbar>

        <p>
            This is the sources page.
        </p>
    </v-container>
</template>

<script>
import customToolbar from '@/components/CustomToolbar'
import standaloneTitleHelpers from '@/mixins/standaloneTitleHelpers'
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
            browser.tabs.sendMessage(tabs[0].id, { type: "getText"})
            .then( (response) => {

                let allHashes = this.hashPageContent(response.content);
                console.log(allHashes, 'inja')
                this.getTitleMatches({titlehashes: allHashes})
                .then(resp => {
                    console.log(resp.data)
                })
                //$("#text").text(response);
            });
        });
    },
    methods: {
        ...mapActions('titles', [
            'getTitleMatches'
        ])
    },
    mixins: [standaloneTitleHelpers]
}
</script>