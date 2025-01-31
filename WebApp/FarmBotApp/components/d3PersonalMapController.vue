<template>
  <v-row class="ma-n5 pb-0" style="position: relative;">
    <v-col cols="12">
      <d3PersonalMapCreator :filters="filters" />
      <!-- Toggle Menu Button -->
      <v-btn icon class="toggle-menu-btn" @click="toggleMenu">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
      <!-- Toggle Menu -->
      <v-expand-transition>
        <v-card v-if="menuVisible" class="toggle-menu" elevation="5">
          <v-list dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  <v-switch v-model="filters.toggle1" hide-details color="primary" label="Display Photos"></v-switch>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  <v-switch v-model="filters.toggle2" hide-details color="primary" label="Display Plants & Weeds"></v-switch>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  <v-switch v-model="filters.toggle3" hide-details color="primary" label="Display Robot"></v-switch>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  <v-switch v-model="filters.toggle4" hide-details color="primary" label="Display Distances"></v-switch>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  <v-switch v-model="filters.toggle5" hide-details color="primary" label="Play Timelapse"></v-switch>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-expand-transition>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import d3PersonalMapCreator from '@/components/d3PersonalMapCreator.vue';
import {useConnectionStore} from '~/stores/clientSocketStore';

const ConnectionStore = useConnectionStore();

function logCurrentVisualizations(filters) {
 ConnectionStore.logAction("personalMapFilterChange", { filters: filters });
}

// Reactive references for the dropdown menu visibility and toggle button states
const menuVisible = ref(false);
const filters = ref({
  toggle1: false,
  toggle2: true,  // Display Plants
  toggle3: true,  // Display Robot
  toggle4: true,  // Display Distances
  toggle5: false,
});

// Watch to trigger reactivity for toggles and ensure changes are reflected in the d3GlobalMapCreator component
watch(filters, (newFilters) => {
  
  if (newFilters.toggle1) {
    newFilters.toggle5 = false;
  }
  if (newFilters.toggle5) {
    newFilters.toggle1 = false;
  }
  console.log('Filters updated:', newFilters);
  logCurrentVisualizations(newFilters);
}, { deep: true });

// Function to toggle the dropdown menu visibility
const toggleMenu = () => {
  menuVisible.value = !menuVisible.value;
};

// Function to navigate to a specific path
const navigateTo = (path) => {
  window.location.href = path;
};
</script>

<style scoped>
.custom-button {
  background-color: #88B56E !important;
  color: white !important;
}
.toggle-menu-btn {
  position: absolute;
  top: 0px;
  right: 0px;
}
.toggle-menu {
  position: absolute;
  top: 50px;
  right: 10px;
  width: 200px;
  z-index: 1000;
}

.move-up-z-index {
  z-index: 1000;
}
</style>
