<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useConnectionStore } from '~/stores/clientSocketStore';
import { useFarmbotStore } from '~/stores/farmbotStore';

const { data } = useAuth();


const FarmBotStore = useFarmbotStore();
const ConnectionStore = useConnectionStore();


onMounted(() => {
  console.log("Settings mounted");

});


let interactionLevel = ref(FarmBotStore.userSettings.interactionLevel)
console.log('interactionLevel', interactionLevel.value)

async function storeSettings() {
  if (interactionLevel.value === FarmBotStore.userSettings.interactionLevel) return;
  ConnectionStore.logAction('interactionLevelChange', { old: FarmBotStore.userSettings.interactionLevel, new: interactionLevel.value });
  let settings = await $fetch('api/prisma/user/' + data.value?.user?.name + '/settings', {
    method: 'PUT',
    body: {
      interactionLevel: interactionLevel.value,
    }
  });
  FarmBotStore.userSettings.interactionLevel = settings.interactionLevel;
}

</script>

<template>
  <v-radio-group v-model="interactionLevel" label="FarmBot Interaction Level">
  <v-radio  label="Fully Automated" :value=0></v-radio>
  <v-radio  label="Semi-Automation" :value=1></v-radio>

  <v-radio  label="Manual Control" :value=2></v-radio>
</v-radio-group>
    <v-card v-if="interactionLevel == 0" class="pa-4">
      You decide what to plant, but the farming robot takes care of all the sowing, watering, weeding and any other planting tasks.
    </v-card>
    <v-card v-if="interactionLevel == 1" class=" pa-4">
      You decide what to plant, where to plant it, when to water it, and when weeds should be removed. The farming robot will review your actions and may stop you from making decisions that could negatively impact your field. 
    </v-card>
    <v-card v-if="interactionLevel == 2" class=" pa-4">
      You decide what to plant, where to plant it, when to water it, and when weeds should be removed. The farming robot will review your actions and may warn you if your decisions could negatively impact your field but it will not be able to stop you. 
    </v-card>
<v-spacer class="py-2"></v-spacer>
<v-btn color="primary" @click="storeSettings()" prepend-icon="mdi-content-save-outline">Save</v-btn>

</template>