<script lang="ts" setup>
import {useConnectionStore} from '~/stores/clientSocketStore';
import {socket} from '~/socket/socket'

//const ConnectionStore = useConnectionStore();
//ConnectionStore.bindEvents()

const showToast = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

function displayToast(message: string, color = 'success') {
  toastMessage.value = message;
  toastColor.value = color;
  showToast.value = true;
}
provide('displayToast', displayToast);
</script>

<template>

  <div>
    <v-app>
    <NuxtLayout>
      <NuxtLoadingIndicator />
      <NuxtPage /> <!-- This enables nuxt pages and automatically opens the pages/index.vue page-->
    </NuxtLayout>
  </v-app>
  </div>
  
  <v-snackbar
      v-model="showToast"
      :color="toastColor"
      :timeout="3000"
  
    >
      {{ toastMessage }}
    </v-snackbar>
</template>