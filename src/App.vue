<script setup>
import AuthManager from "./components/auth/AuthManager.vue";
</script>

<template>
  <div id="app">
    <AuthManager />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Futura, "Trebuchet MS", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: white;
}

#app {
  min-height: 100vh;
}
</style>
