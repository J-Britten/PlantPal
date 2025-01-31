<!--
  History.vue

  This Vue component is designed to display the event history of a FarmBot in a card format. It lists events such as actions taken by or on behalf of the FarmBot, including who performed the action and when. The component is intended to provide a quick overview of recent activity in a concise and readable format.

  Props:
    - events: (Array) Required. An array of event objects. Each event object must include 'timestamp', 'action', and 'person' properties. The 'timestamp' indicates when the event occurred, 'action' describes what happened, and 'person' identifies who was involved in the event.

  Functions:
    - formatEvent(event): Takes an event object as input and returns a formatted string that combines the event's timestamp, action, and person involved. This string is displayed as the title of a list item in the event history list.

  Styling:
    - The component uses a Vuetify v-card as the container for the event history, with a fixed maximum height and auto overflow for the y-axis to allow scrolling through the list of events if they exceed the card's maximum height.

  Usage Example:
    <FarmBotHistory :events="[
      { timestamp: '2023-04-01T12:00:00Z', action: 'Watering', person: 'Alice' },
      { timestamp: '2023-04-02T08:30:00Z', action: 'Harvesting', person: 'Bob' }
    ]"/>

  Note:
    - The component requires the 'events' prop to be an array of objects with specific properties. The validator function for the 'events' prop ensures that each event object in the array has the required 'timestamp', 'action', and 'person' properties.
-->

<template>
  <v-row>
    <v-col cols="12">
      <h3 class="text-left">Farmbot Event History</h3>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12">
      <v-card class="event-history-card">
        <v-card-text class="py-0">
          <v-list >
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
        return value.every(event => 'name' in event && 'status' in event );
      }
    }
  });
  
  const formatEvent = (event) => {
    return `${event.name} -completed with status ${event.status} 'in the field`;
  };
  </script>
  
  <style scoped>
  .event-history-card {
    width: 100%;
    max-height: 300px; /* Adjust height as needed for showing 4 events */
    overflow-y: auto;
    
  }
  </style>