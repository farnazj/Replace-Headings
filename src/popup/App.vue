<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import Fuse from 'fuse.js'

export default {
  name: 'App'
}
</script>

<style>
html {
  width: 400px;
  height: 400px;
}
</style>
