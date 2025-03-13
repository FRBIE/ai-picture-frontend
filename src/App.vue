<template>
  <div id="app">
    <BasicLayout />
  </div>
</template>

<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
import '@/access' //fix login status invalid issue

</script>
<style>
#app {
}
</style>
