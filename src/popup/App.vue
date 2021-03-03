<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import Fuse from 'fuse.js'
import { mapActions } from 'vuex';

export default {
  name: 'App',
  created() {
    // this.logout();
  },
  methods: {
    ...mapActions('auth', [
      'logout'
    ])
  }
}
</script>

<style>
html {
  width: 400px;
  height: 400px;
}
</style>
