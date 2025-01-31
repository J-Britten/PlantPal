<template>
  <!-- This layout is a temporary solution to ensure the old default layout is still functional-->
  <v-alert
  v-if="disconnected"
  density="compact"
  text="This window was disconnected from the server. This may occur if the app is opened in multiple browser tabs. Please close this tab"
  title="Disconnected from the App"
  type="warning"
  style="position:absolute; bottom:64px; left:0; right:0; z-index: 10000;"
></v-alert>
  <slot />
</template>

<script setup>
let disconnected = ref(false)


function displayDisconnect() {
disconnected.value = true;
}
provide('displayDisconnect', displayDisconnect);

</script>