<template>
    <v-col class="ml-n5 pr-0">
        <FarmbotCard :message="card_message" />
            <TodoComponent v-if="farmbotStore.userSettings.interactionLevel > 0" />
            <SeedingSlideGroup />
            <MaintenanceSlideGroup />
    </v-col>

  </template>
  
  <script setup lang="ts">
  import FarmbotCard from './FarmbotCard.vue';
  import TodoComponent from './TodoComponent.vue';
  import SeedingSlideGroup from './SeedingSlideGroup.vue';
  import MaintenanceSlideGroup from './MaintenanceSlideGroup.vue';
  import { useFarmbotStore } from "~/stores/farmbotStore";

  
  const farmbotStore = useFarmbotStore();
  const interactionLevel = farmbotStore.userSettings.interactionLevel;
  const card_message = ref("Here you can sow new plants, take care of existing plants, and keep your field free from weeds. <strong>Scroll down to see possible actions</strong>.");

onMounted(() => {
    if (interactionLevel == 0){
        const difference_time = ref(0);
        const current_time = new Date();
        const target_time = new Date();
        target_time.setHours(18, 0, 0, 0); // Set target time to 18:00 on the current day

        const time_difference = target_time.getTime() - current_time.getTime();
        difference_time.value = time_difference;
        if (time_difference < 3600000 && time_difference > 0) { // If less than an hour left
            card_message.value = "If you have plants planted, FarmBot will water your plants at 18:00! You can watch live using the live camera feed.";
        }   
    }
});



  // load necessary data and distribute onto relevant components
  </script>
