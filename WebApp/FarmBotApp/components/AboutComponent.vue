<template>
  <v-container fluid class="overflow-y-auto" :style="{ maxHeight: viewportHeight + 'px' }">
    <v-row>
      <v-col cols="12" class="py-2">
        <h2>FAQ</h2>
        <ul>
          <ul><b>What's my task during this study?</b></ul>
          Plant a minimum of 6 crops on your assigned field. Then, using the app, take care of your plants for 21 days or until you decide to quit your participation.
          <ul><b>How many crops can I plant maximum?</b></ul>
          You can plant more than the minimum 6 crops but keep in mind that you have limited space on your field and should take care of all the plants you plant.
          <ul><b>Do I need to use the application all the time?</b></ul>
          As for real gardening, you need to take care of your plants regularly. The more you take care of your plants, the better they will grow. You can decide how much you want to interact with the app. You can fully automate the process, semi-automate it, or control everything manually.
          <ul><b>What happens if I don't take care of my plants?</b></ul>
          If you don't take care of your plants, they will die unless your interaction level is set to fully automated. In this case, the farming robot will take care of your plants and you just need to watch. If you don't take care of your plants and do not set your interaction level to fully automated, other participants may remind you to take care of your plants via chat messages.
          <ul><b>What happens if I decide to quit?/How do I quit?</b></ul>
          If you decide to quit, you can do so at any time. Simply contact albin.zeqiri@uni-ulm.de and write a short message stating that you would like to quit. You will then receive the final post study questionnaire and the compensation will be paid out. 
          <ul><b>What do I do if I feel that there has been a technical issue with my account, the app, or the robot?</b></ul>
          In this case you can either report the bug you found in the app using the report function or contact albin.zeqiri@uni-ulm.de.
          <ul><b>How and when do I receive my compensation?</b></ul>
          Your compensation will be paid out to you in your preferred method (PayPal, Amazon gift card) after you have completed the study. You will receive the compensation after you have completed the final post study questionnaire.
        </ul>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

const viewportHeight = ref(0);

const updateWindowHeight = () => {
  viewportHeight.value = window.innerHeight - 150;
};

onMounted(() => {
  updateWindowHeight();
  viewportHeight.value = window.innerHeight - 150;
});

    
  

</script>

<style>
.scrollable-div {
  overflow-y: auto;
  max-height: 600px; /* Adjust the height as needed */
}
</style>