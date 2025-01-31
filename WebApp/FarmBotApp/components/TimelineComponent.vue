<!--
TimelineComponent.vue

This component is responsible for displaying the timeline of milestones. It contains a tab to switch between global and user milestones and a timeline to display the milestones.

-->

<script lang="ts" setup>
import { useTimelineStore } from '~/stores/timelineStore';

const { data } = useAuth()
const ConnectionStore = useConnectionStore();
console.log("Timeline page", ConnectionStore.userData.value)
const timelineStore = useTimelineStore()

//await timelineStore.fetchUserMilestones()
//await timelineStore.fetchPublicMilestones()

const usePublicPosts = ref(true)
let loading = ref(false)
const posts = computed(() => {
  return usePublicPosts.value ? timelineStore.publicPosts : timelineStore.userPosts;
});

async function load() {
  loading.value = true
  if (usePublicPosts.value) {
    await timelineStore.fetchPublicPosts()
  } else {
    await timelineStore.fetchPrivatePosts()
  }
  setTimeout(async () => {

    loading.value = false
  }, 1000)
}

onMounted(async () => {
  if(timelineStore.publicPosts.length == 0)  await timelineStore.fetchPublicPosts()
  if(timelineStore.userPosts.length == 0)  await timelineStore.fetchPrivatePosts()
})

</script>
<template>
  <div class="overflow-auto fill-height">
    <v-tabs v-model="usePublicPosts" fixed-tabs
      style="position: fixed; top: 64px; left:0; right:0; z-index: 10; background-color: white;">
      <v-tab :value="true">
        Global
      </v-tab>
      <v-tab :value="false">
        You
      </v-tab>
    </v-tabs>
    <v-timeline align="start" side="end" style="float:left;" class="pt-4">
      <v-timeline-item v-for="(item, i) in posts" :key="i" dot-color="primary"
        :icon="item.type == 0 ? 'mdi-information' : 'mdi-sprout'" fill-dot size="small">
        <v-card>
          <v-card-subtitle class="pt-2">{{ new Date(item.createdAt).toLocaleString('de-de', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}} -
            {{ item.userName }}</v-card-subtitle>
          <v-card-title :class="['text-h6', `pt-0`]">
            {{ item.title }}
          </v-card-title>
          <img :src="item.image" class="mx-auto post-image" />
          <v-card-text class="bg-white text--primary pb-7">
            {{ item.text }}
            <!--<v-btn color="primary" variant="text" size="small" prepend-icon="mdi-heart"
              style="position: absolute; bottom: 5px; right: 5px;">
              0
            </v-btn>-->
          </v-card-text>
        </v-card>
      </v-timeline-item>
      <v-timeline-item dot-color="primary" fill-dot size="small">
        
        <v-btn :loading="loading" height="48" variant="tonal" color="primary" @click="load">Load
          More</v-btn>
       
      </v-timeline-item>
    </v-timeline>

  </div>
</template>

<style>.post-image {
  max-width: 100%;
  height: auto;
}</style>