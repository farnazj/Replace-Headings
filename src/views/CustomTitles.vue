<template>
    <hello-world></hello-world>
</template>

<script>
import helloWorld from '@/components/HelloWorld';
import customTitles from '@/components/CustomTitles'

export default {
    components: {
        'hello-world': helloWorld,
        'custom-titles': customTitles
    },
    data() {
        return {
        }
    },
    props: ['titleId'],
    created() {

    },
    watch: {
        
    }
}
</script>