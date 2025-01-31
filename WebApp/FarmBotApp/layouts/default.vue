<template>
 
    <NavigationTop />
    <v-spacer class="pt-16"></v-spacer> 
    <v-alert
    v-if="disconnected"
    density="compact"
    text="This window was disconnected from the server. This may occur if the app is opened in multiple browser tabs. Please close this tab"
    title="Disconnected from the App"
    type="warning"
    style="position:absolute; top:64px; left:0; right:0; z-index: 1000;"
  ></v-alert>
    <slot />
    <NavigationBottom />
  
</template>

<script setup>
let disconnected = ref(false)


function displayDisconnect() {
  disconnected.value = true;
}
provide('displayDisconnect', displayDisconnect);

</script>