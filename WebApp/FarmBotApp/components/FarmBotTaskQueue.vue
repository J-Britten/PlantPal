<template>
  <!-- <v-row>
    <v-col cols="12">
      <History :events="Events" />
    </v-col>
  </v-row>-->
 <!-- <template v-if="connectionStore.currentTask.taskName">
  <v-row>

    <v-col cols="12" class="text-left mt-3 mb-0 pb-0 pl-0">
      <v-card-title>Current Task</v-card-title>
    </v-col>
    <v-col cols="12">
      <v-card class="event-queue-card" style="min-height:32px;">
        <v-card-text class="py-0">
          <v-list>
            <v-list-item :title="connectionStore.currentTask.taskName" >
              <v-list-item-subtitle>{{ connectionStore.currentTask.taskOwner }} <v-chip>{{ new Date(connectionStore.currentTask.createdAt).toLocaleString('de-de', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</v-chip></v-list-item-subtitle>
              Working on it since: {{ new Date(connectionStore.currentTask.startedAt).toLocaleString('de-de', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}}
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

    </v-col>
  </v-row>
</template>-->
  <v-row>
    <!-- <Queue :events="EventsQueue" />-->
    <v-col cols="12" class="text-left mt-3 mb-0 pb-0 pl-0">
      <v-card-title>Upcoming Tasks <template v-if="connectionStore.queue.length > 0">({{ connectionStore.queue.length }})</template></v-card-title>
    </v-col>

    <v-col cols="12">
      <v-card class="event-queue-card">
        <v-card-text >
          <template v-if="connectionStore.queue.length == 0">Here you will see what tasks FarmBot has scheduled. Currently there are none!</template>
          <v-list>
            <v-list-item v-for="(task, index) in connectionStore.queue" :key="index"  :title="task.taskName" >
              <v-list-item-subtitle>{{ task.taskOwner }} <v-chip>{{ new Date(task.createdAt).toLocaleString('de-de', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</v-chip></v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { defineProps, watchEffect } from 'vue';
import History from '~/components/History.vue';
import Queue from '~/components/Queue.vue';
import { useConnectionStore } from '~/stores/clientSocketStore';


const connectionStore = useConnectionStore();
//const queue = connectionStore.queue;

//const EventsQueue = queue;

/*watchEffect(() => {
  const jobsStatus = connectionStore.jobs; // contains the events but currently has transmission issues
  const queue = connectionStore.queue;
  //console.log(jobsStatus, 'jobStatus [FROM FarmbotHistory]'); // name of job and status
  //console.log(queue, 'jobStatus [FROM FarmbotHistory]'); // name of job and person
});*/
</script>

<style scoped>
  .event-queue-card {
    
    max-height: 300px; /* Adjust height as needed for showing 4 events */
    overflow-y: auto;
  }
</style>
