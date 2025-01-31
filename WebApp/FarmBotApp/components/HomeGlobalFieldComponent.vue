<script setup lang="ts">
import FarmBotTaskQueue from './FarmBotTaskQueue.vue';
import WeatherCard from './WeatherCard.vue';
const connectionStore = useConnectionStore();
const farmbotStore = useFarmbotStore();
const weatherStore = useWeatherStore();

// Watch for changes in connectionStore.currentTask.taskName

function mapInteractionLevelToString(interactionLevel: number) {
  switch (interactionLevel) {
    case 0:
      return "[Automated].";
    case 1:
      return "[Hybrid].";
    case 2:
      return "[Manual].";
  }
}

function getMsg() {
  if (connectionStore.currentTask.taskName) {
    return "FarmBot is working on a " + connectionStore.currentTask.taskName + " task by " + connectionStore.currentTask.taskOwner + " since " + new Date(connectionStore.currentTask.startedAt).toLocaleString('de-de', { hour: '2-digit', minute: '2-digit' }) + ".";
  } else if (weatherStore.currentTemperature-3 > 25 || weatherStore.currentTemperature < 0) {
    return `The current temperature is <b> ${weatherStore.currentTemperature-3} °C!</b> This is too ${weatherStore.currentTemperature > 25 ? 'hot' : 'cold'} for FarmBot to operate. 
     You can schedule new tasks, but FarmBot won't work on them until the temperature is between 0°C and 25°C. `;
  } else {
    return "This is PlantPal! PlantPal will help you take care of your garden! Your automation level is set to <b>" + mapInteractionLevelToString(farmbotStore.userSettings.interactionLevel) + "</b> You can <b>change</b> this in the <b>settings (top left)</b>.";
  }

}
// load necessary data and distribute onto relevant components
</script>
<template>
  <FarmbotCard :message="getMsg()" />
  <FarmBotTaskQueue />
  <WeatherCard />
</template>