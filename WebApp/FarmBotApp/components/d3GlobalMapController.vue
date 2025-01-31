<!--
  D3GlobalMapController.vue

  This Vue component acts as a controller for a global map visualization, providing UI elements for user interaction and controlling the display of various elements on the map. It integrates with the D3GlobalMapCreator component to render the map and uses Vuetify components for the UI.

  Features:
    - Navigation Buttons: Two buttons allow users to navigate to different views ('Show all fields' and 'Show my field').
    - Dynamic Filters: A toggle menu with switches allows users to dynamically control the visibility of certain elements on the map, such as photos and avatars.
    - Responsive Design: Utilizes Vuetify's grid system to ensure the component is responsive across different screen sizes.

  Props:
    - filters: An object that stores the state of filters applied to the map. This object is passed as a prop to the D3GlobalMapCreator component, allowing the map to reactively update based on filter changes.

  Data:
    - menuVisible: A boolean that controls the visibility of the toggle menu. It is toggled by the menu button.

  Methods:
    - navigateTo(route): Accepts a route as an argument and uses Vue Router to navigate to the specified route.
    - toggleMenu(): Toggles the visibility of the filter toggle menu.

  Usage:
    This component is designed to be used in applications that require interactive map visualizations with dynamic filtering capabilities. It provides a user-friendly interface for controlling what data is displayed on the map.

  Dependencies:
    - Vue 3 and Vue Router: For component structure and routing.
    - Vuetify: For UI components and responsive design.
    - D3GlobalMapCreator.vue: A child component responsible for rendering the map based on the provided filters.

-->

<template>
  <v-row class="move-up-on-z-index" style="position: relative;">
      <v-col cols="12">
        <d3GlobalMapCreator :filters="filters" />
        <!-- Toggle Menu Button -->
        <v-btn
          icon
          class="toggle-menu-btn"
          @click="toggleMenu"
        >
          <v-icon>mdi-cog</v-icon>
        </v-btn>
        <!-- Toggle Menu -->
        <v-expand-transition>
          <v-card v-if="menuVisible" class="toggle-menu" elevation="2">
            <v-list lines="one">
              <v-list-item>
                    <v-switch v-model="filters.toggle1"  hide-details color="primary" label="Display Photos"></v-switch>
              </v-list-item>
              <!-- <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    <v-switch v-model="filters.toggle2" hide-details  color="primary" label="Display People"></v-switch>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item> -->
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    <v-switch v-model="filters.toggle3"  hide-details color="primary" label="Display Robot"></v-switch>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    <v-switch v-model="filters.toggle4"  hide-details color="primary" label="Display Plants"></v-switch>
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
import d3GlobalMapCreator from '@/components/d3GlobalMapCreator.vue';
import {useConnectionStore} from '~/stores/clientSocketStore';

const ConnectionStore = useConnectionStore();


function logCurrentVisualizations(filters) {
 ConnectionStore.logAction("globalMapFilterChange", { filters: filters});
}

// Reactive references for the dropdown menu visibility and toggle button states
const menuVisible = ref(false);
const filters = ref({
  toggle1: false,
  toggle2: true,  // Display Avatars
  toggle3: true,  // Display Robot
  toggle4: true,  // Display Plants
});

// Watch to trigger reactivity for toggles and ensure changes are reflected in the d3GlobalMapCreator component
watch(filters, (newFilters) => {
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
  border-radius: 20px;
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
}

.move-up-on-z-index {
  z-index: 1000;

}

</style>
