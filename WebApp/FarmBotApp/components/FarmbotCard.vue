<template>
  <v-row>
    <v-col cols="12">
      <v-card class="pa-3 farmbot-card">
        <v-row no-gutters class="align-center">
          <v-col cols="2" class="text-left ml-n3 pl-0 mr-3">
            <v-icon size="88">
              <v-img src="@/assets/robot64.png" alt="FarmBot"></v-img>
            </v-icon>
          </v-col>
          <v-col cols="10" class="d-flex align-center pl-4">
            <v-card-text v-html="message" class="message-text"></v-card-text>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

// Define the props
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.farmbot-card {
  width: 100%;
  background-color: white;
  overflow-y: auto;
  box-shadow: none;
  border: none;
}

.message-text {
  font-size: 16px; /* Ensure the font size is 16px */
}
</style>
