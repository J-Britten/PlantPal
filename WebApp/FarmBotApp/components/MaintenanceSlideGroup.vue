<template>
  <v-sheet class="mx-auto" color="white">
    <v-row>
      <v-col cols="7">
        <v-card-title class="mb-0 mt-10">
          Maintenance
        </v-card-title>
      </v-col>
      <v-col cols="4">
        <v-icon size="48">
          <img :src="waterImg" alt="water-icon" width="48" height="16"> X
        </v-icon>
      </v-col>
    </v-row>

    <v-slide-group v-model="model" class="pt-0">
      <v-slide-group-item
        v-if="interactionLevel > 0"
        v-for="(item, index) in carouselItems"
        :key="index"
        v-slot="{ isSelected, toggle }"
      >
        <v-card
          :class="['ma-4', 'pa-4', 'rounded', isSelected ? 'selected-background' : '']"
          color="bg-primary"
          width="110"
          height="110"
          @click="toggleCard(index)"
        >
          <v-row>
            <v-col cols="12" class="text-center">
              <v-icon size="36">
                <img :src="item.icon" alt="icon" width="36px" height="36px" />
              </v-icon>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="text-center pt-0">
              {{ item.title }}
            </v-col>
          </v-row>
        </v-card>
      </v-slide-group-item>
    </v-slide-group>

    <v-expand-transition>
      <v-sheet v-if="model !== null && carouselItems[model]" height="200" color="white">
        <v-row v-if="carouselItems[model].waterDialog">
          <v-col cols="12">
          <!--  <v-select
              v-model="value"
              :items="waterList"
              item-text="title"
              item-value="id"
              label="Select plants to water."
              chips
              multiple
            ></v-select>-->
            <v-row>
              <!-- <v-col cols="3" class="pt-0">
                <v-btn @click="showSelectedItems">Water</v-btn>
              </v-col> -->
              <v-col cols="12" class="pt-2 ml-5">
                <v-btn @click="waterAllPlants">Water All</v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col cols="12">
            <v-select
              v-model="value"
              :items="weedingList"
              item-text="title"
              item-value="id"
              label="Select plants to weed."
              chips
              multiple
            ></v-select>
            <v-row>
              <v-col cols="9" class="pt-0 text-right">
                <v-btn v-if="interactionLevel == 2" @click="showSelectedWeedCut" :disabled="weedingList.length === 0">Cut Down</v-btn>
              </v-col>
              <v-col cols="3" class="pt-0 text-right">
                <v-btn v-if="interactionLevel == 2" @click="showSelectedWeedHack" :disabled="weedingList.length === 0">Hack</v-btn>
              </v-col>
              <v-col cols="3" class="pt-0 text-right">
                <v-btn v-if="interactionLevel == 1" @click="showSelectedWeed" :disabled="weedingList.length === 0">Remove</v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-sheet>
    </v-expand-transition>
    <v-row v-if="interactionLevel === 0">
      <v-col cols="12" class="text-left pl-7">
        <p>Your interaction level is set to <b>[Full Automation]</b>. Farmbot will water your plants and hack your weeds for you until you change your interaction level.</p>
      </v-col>
    </v-row>
    <FarmbotCard v-if="showFarmbotCard" :message="selectedPlantMessage"/>
  </v-sheet>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import watering from '@/assets/watering.png';
import weeding from '@/assets/weeding.png';
import FarmbotCard from './FarmbotCard.vue';
import { useFarmbotStore } from '~/stores/farmbotStore';
import { waterAllOfOneField, waterSelected, weedSimple, weed} from '../utils/fieldHelper';
import { mapStores } from 'pinia';


export default {
  computed: {
        ...mapStores(useFarmbotStore)
      },
  setup() {
    const farmbotStore = useFarmbotStore();
    const ConnectionStore = useConnectionStore();
    const waterImg = watering;

    const model = ref(null);
    const carouselItems = [
      { icon: watering, title: "Watering", waterDialog: true },
      { icon: weeding, title: "Weeding", waterDialog: false }
    ];
    const waterList = farmbotStore.PlantsOfoneField;
    const weedingList = farmbotStore.WeedsOfoneField;
    const value = ref(null);
    const selectedItems = ref([]);
    const showFarmbotCard = ref(false);
    const selectedPlantMessage = ref('');
    const interactionLevel = farmbotStore.userSettings.interactionLevel;

    const toggleCard = (index) => {
      model.value = model.value === index ? null : index;
      showSelectedItems();
      deselectChips();
    };

    const deselectChips = () => {
      value.value = [];
    };

    const waterAllPlants = () => {
      waterAllOfOneField();
      showFarmbotCard.value = true;
      selectedPlantMessage.value = `FarmBot is now watering`;
      ConnectionStore.logAction('waterAll', { a: 0});
      console.log('WaterAll added');
    };

    const showSelectedItems = () => {
      if (model.value !== null && carouselItems[model.value] && carouselItems[model.value].waterDialog) {
        if (value.value && value.value.length > 0) {
          selectedItems.value = value.value.map(val => waterList.find(item => item.id === val));
          const selectedIds = selectedItems.value.map(item => item.id);
          waterSelected(selectedIds);
          console.log(`Selected plants for watering (IDs): ${selectedIds.join(', ')}`);
          ConnectionStore.logAction('waterSelected', { a: 0 });
        } else {
          console.log('No plants selected for watering');
        }
      } else {
        console.log('Weeding section selected');
      }
    };

    const showSelectedWeed = () => {
      if (model.value !== null && carouselItems[model.value] && !carouselItems[model.value].waterDialog) {
        if (value.value && value.value.length > 0) {
          selectedItems.value = value.value.map(val => weedingList.find(item => item.id === val));
          const selectedIds = selectedItems.value.map(item => item.id);
          console.log(`Selected plants for weeding (IDs): ${selectedIds.join(', ')}`);
          weedSimple(selectedIds);
          ConnectionStore.logAction('weedSimple', { a: 0});
        } else {
          console.log('No plants selected for weeding');
        }
      }
    };

    const showSelectedWeedHack = () => {
      if (model.value !== null && carouselItems[model.value] && !carouselItems[model.value].waterDialog) {
        if (value.value && value.value.length > 0) {
          selectedItems.value = value.value.map(val => weedingList.find(item => item.id === val));
          const selectedIds = selectedItems.value.map(item => item.id);
          console.log(`Selected plants for weeding (IDs): ${selectedIds.join(', ')}`);
          // weed(selectedIds, 'hack');
          ConnectionStore.logAction('weedHack', {a: 0 });
        } else {
          console.log('No plants selected for weeding');
        }
      }
    };

    const showSelectedWeedCut = () => {
      if (model.value !== null && carouselItems[model.value] && !carouselItems[model.value].waterDialog) {
        if (value.value && value.value.length > 0) {
          selectedItems.value = value.value.map(val => weedingList.find(item => item.id === val));
          const selectedIds = selectedItems.value.map(item => item.id);
          console.log(`Selected plants for weeding (IDs): ${selectedIds.join(', ')}`);
          // weed(selectedIds, 'cut');
          ConnectionStore.logAction('weedCut', {a: 0 });
        } else {
          console.log('No plants selected for weeding');
        }
      }
    };

    return {
      model,
      carouselItems,
      waterList,
      weedingList,
      value,
      showFarmbotCard,
      selectedPlantMessage,
      interactionLevel,
      toggleCard,
      waterAllPlants,
      showSelectedItems,
      showSelectedWeed,
      showSelectedWeedHack,
      showSelectedWeedCut,
    };
  },
};
</script>

<style scoped>
.v-card.selected-background {
  background-color: rgba(54, 66, 45, 0.6) !important; /* Adding !important to enforce precedence */
  opacity: 0.6 !important; /* Adding !important to enforce precedence */
}

.v-card.rounded {
  border-radius: 15px;
}
</style>