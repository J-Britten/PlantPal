<script lang="ts" setup>

const {  data   } = useAuth()

//const ConnectionStore = useConnectionStore();

const model = defineModel()

</script>

<template>
  <v-layout class="overflow-visible">
    <v-bottom-navigation
      v-model="model"
      color="primary"
      horizontal
      v-if="data?.user"
      grow
      rounded="xl"
      density="comfortable"
      class="pa-1"
      style="width: calc(100% - 16px); left: 8px; bottom: 12px; position: fixed; z-index: 1000;"
    >
    <v-btn rounded="xl" variant="flat" :ripple="false" value="field" >
        Field
      </v-btn>
      <v-btn  rounded="xl" variant="flat" :ripple="false" value="live">
        Live
      </v-btn>
      <v-btn  rounded="xl" variant="flat" :ripple="false" value="timeline">
        Timeline
      </v-btn>
      <v-btn  rounded="xl" variant="flat" :ripple="false" value="chat">
     <!--   <v-badge dot color="error" :content="ConnectionStore.newChatMessages" :model-value="ConnectionStore.newChatMessages > 0"></v-badge>
-->
        <span>Chat</span>
      </v-btn>
    
    </v-bottom-navigation>
    <v-bottom-navigation
      
      color="primary"
      horizontal
      v-else
    ></v-bottom-navigation>

  </v-layout>
</template>


<style>

</style>