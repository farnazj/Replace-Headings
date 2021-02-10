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

        console.log('home got created')

        browser.tabs.query({ active: true, currentWindow: true })
        .then( tabs => {
            browser.tabs.sendMessage(tabs[0].id, { type: "close_sidebar" });
        })

        browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            console.log(message)
            if (message.type == 'show_custom_titles') {
                console.log('hiiiii')
                console.log(message.data)
                // message.data

                // this.$router.push({ name: 'customTitles' });
            }
        });

    if (!this.titles.length)
        this.setUpTitles();

    },
    computed: {
        ...mapState('titles', ['titles'])
    },
    methods: {
        ...mapActions('titles', ['setUpTitles'])
    },
    mixins: [standaloneTitleHelpers]
}
</script>