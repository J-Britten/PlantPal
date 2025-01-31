<template>
    <v-row>
      <v-col cols="12">
        <h3 class="text-left">Upcoming Events</h3>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card class="event-queue-card overflow-y-auto" >
          <v-card-text class="py-0">
            <v-list>
              <v-list-item v-for="(event, index) in events" :key="index">
                <v-list-item-content>
                  <v-list-item-title>{{ formatEvent(event) }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </template>
  
  <script setup lang="ts">
  import { defineProps } from 'vue';
  
  const props = defineProps({
    events: {
      type: Array,
      required: true,
      validator: value => {
        return value.every(event => 'name' in event && 'person' in event );
      }
    }
  });
  
  const formatEvent = (event) => {
    return `${event.name} -was added by ${event.person}`;
  };
  </script>
  
  <style scoped>
  .event-queue-card {
    width: 100%;
    max-height: 300px; /* Adjust height as needed for showing 4 events */
    overflow-y: auto;
  }
  </style>
  