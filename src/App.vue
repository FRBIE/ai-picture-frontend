<template>
  <div id="app">
    <BasicLayout />
  </div>
</template>

<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
import {testHealthUsingGet} from "./api/mainController";
import {useLoginUserStore} from "@/stores/useLoginUserStore";


const loginUserStore = useLoginUserStore()
loginUserStore.fetchLoginUser()

testHealthUsingGet().then(() =>{
  console.log("good")
})
</script>
<style>
#app {
}
</style>
