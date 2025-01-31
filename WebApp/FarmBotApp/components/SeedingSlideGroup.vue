<!--
  SeedingSlideGroup.vue

  This Vue component is designed to display a group of seed options in a slide format, allowing users to browse through different types of seeds such as Tomato, Radish, Marigold, Cornflower, and Cumin. Each seed option is represented by a card that includes an icon, a title, and a collapsible content area with additional details.

  Data Structure:
    - The component's data includes an array of objects, each representing a seed option. Each object contains:
      - icon: A variable representing the icon associated with the seed.
      - title: A string representing the name of the seed.
      - openIcon: A boolean indicating if the icon is an OpenCropIcon or a personal png.
      - content: An array of objects, each containing a 'key' and 'value' pair providing more details about the seed.

  Features:
    - Dynamic Display: The component dynamically generates a card for each seed option based on the data provided.
    - Collapsible Content: Users can expand or collapse the content area of each card to view more details about the seed.
    - Styling: Custom CSS styles are applied to enhance the visual appeal of the cards. This includes a selected background opacity change and rounded corners.

  Styling:
    - .v-card.selected-background: Adjusts the opacity of the card's background when selected. The use of `!important` ensures that this style has precedence.
    - .rounded: Applies a border-radius to create rounded corners for a softer, more aesthetic appearance.

-->

<template>
  <v-sheet class="mx-auto" color="white">
    <v-card-title class=" mt-10 mb-0">Seeding</v-card-title>
    <v-slide-group v-model="model" class="pt-0">
      <v-slide-group-item v-for="(item, index) in carouselItems" :key="index" v-slot="{ isSelected, toggle }">
        <v-card :class="[
          'ma-4',
          'pa-4',
          'rounded',
          isSelected ? 'selected-background' : '',
        ]" color="bg-primary" width="112" height="110" @click="() => {
              toggle();
              changeState();
            }
            ">
          <v-row>
            <v-col cols="12" class="text-center">
              <!-- <v-icon v-if="openIcon" size="36">
                  <OpenCropIcon :icon="item.icon" />
              </v-icon>-->
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
      <div v-if="model != null" height="200" color="white">
        <v-row>
          <v-col cols="12" class="mr-5 pl-4">
            <v-list density="compact">
              <v-list-item v-for="content in carouselItems[model].content" :key="content.key" class="my-n2">
                <v-row no-gutters>
                  <v-col class="text-left py-0">{{ content.key }}</v-col>
                  <v-col class="text-right py-0">{{ content.value }}</v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
        <v-row>
          <v-col v-if="interactionLevel >= 1" cols="12" class="mx-2">
            Tap the map where you want to plant the seed.
          </v-col>
          <v-col v-if="interactionLevel < 1" cols="12" class="mx-2">
              <p>Please confirm to plant a seed at a random position on your field. <b>Farmbot will decide</b> where to plant.</p>
          </v-col>

          <v-col cols="12" class="text-right">
            <v-btn color="primary" v-if="interactionLevel >= 1" :disabled="!farmbotStore.CrossClicked" @click="() => {
                approveSeeding();
                model = null;
              }
              " class="mx-2">
              Make farmbot plant</v-btn>
            <v-btn color="primary" v-if="interactionLevel == 0" @click="() => {
                approveSeedingSimple();
                model = null;
              }
              " class="mx-2">
              Make farmbot plant</v-btn>
          </v-col>
          <!-- Add different btns here depending on interaction level -->
          <!-- <v-col cols="12" class="text-right">
                  <v-btn @click="model = null" class="mx-2"> Approve Seeding</v-btn>
              </v-col> -->
        </v-row>
      </div>
    </v-expand-transition>
    <!-- Bestätigungsbutton -->
  </v-sheet>
  <FarmbotCard v-if="showFarmBotCard" :message="selectedPlantMessage" />
  <FarmbotCardPopUp v-if="showFarmbotCardPopUp" :message="selectedPopUpMessage" :confirmButtonText="confirmText"
    :cancelButtonText="cancelText" :showCancelButton="displayCancel" @confirm="handleConfirm"
    @cancel="handleCancel" />

</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useFarmbotStore } from "~/stores/farmbotStore";

import lettuce from "@/assets/lettuce.png";
import radish from "@/assets/radish.png";
import black_cumin from "@/assets/black_cumin.png";
import marigold from "@/assets/marigold.png";
import cornflower from "@/assets/cornflower.png";
import FarmbotCard from "./FarmbotCard.vue";
import FarmbotCardPopUp from "./FarmbotCardPopUp.vue";
import {
  plantSelectedPlant,
  getRandomValue,
  checkIfPlantIsTooCloseToAnotherPlant,
  resetPositionForPlanting,
  transformPixelSeedPositionToMM
} from "../utils/fieldHelper";

import { useConnectionStore } from "~/stores/clientSocketStore";



//console.log(viewport_width);
// TODO
// this was just used to create initial data for the visualisation
// this must be replaced with data from the backend

const farmbotStore = useFarmbotStore();

const ConnectionStore = useConnectionStore();
const model = ref(null);
const carouselItems = ref([
  {
    icon: lettuce,
    title: "Lettuce",
    openIcon: false,
    content: [
      { key: "Germination", value: "7-15 days" },
      { key: "Harvest", value: "6-10 weeks" },
    ],
  },
  {
    icon: radish,
    title: "Radish",
    openIcon: false,
    content: [
      { key: "Germination", value: "3-10 days" },
      { key: "Harvest", value: "3-4 weeks" },
    ],
  },
  {
    icon: marigold,
    title: "Marigold",
    openIcon: false,
    content: [
      { key: "Germination", value: "5-7 days" },
      { key: "Harvest", value: "8-10 weeks" },
    ],
  },
  {
    icon: cornflower,
    title: "Cornflower",
    openIcon: false,
    content: [
      { key: "Germination", value: "7-10 days" },
      { key: "Harvest", value: "10-12 weeks" },
    ],
  },
  {
    icon: black_cumin,
    title: "Cumin",
    openIcon: false,
    content: [
      { key: "Germination", value: "10-14 days" },
      { key: "Harvest", value: "12-16 weeks" },
    ],
  },
]);

const showFarmBotCard = ref(false);
const selectedPlantMessage = ref("");
const showFarmbotCardPopUp = ref(false);
let selectedPopUpMessage = ref("");
const confirmText = ref("confirm");
const cancelText = ref("cancel");
let displayCancel = ref(false);
const interactionLevel = farmbotStore.userSettings.interactionLevel;
const viewportWidth = window.innerWidth;
const viewportHeight = viewportWidth * 0.971;
const bedWidth = viewportWidth;
const bedHeight = viewportHeight*0.75;
const plantLimit = 16;

watch(showFarmBotCard, (newValue, oldValue) => {
  console.log("showFarmBotCard changed:", newValue);
});

function changeState() {
  console.log(interactionLevel);
  if (interactionLevel >= 1) {
    console.log("changedState");
    farmbotStore.togglePlantingActive();
  }
}

async function verifyPlanting(plantPosX, plantPosY) {
  const tooCloseToOtherPlant = await checkIfPlantIsTooCloseToAnotherPlant(plantPosX, plantPosY, 25);
  if (tooCloseToOtherPlant) {
    if (interactionLevel == 1) {
      showPopUp('Error, Plants will be too close to each other. Planting Canceled.', false);
    } else if (interactionLevel == 2) {
      showPopUp('Warning, Plants will be too close to each other. Do you want to plant them anyway?', true);
    }
  }
  return !tooCloseToOtherPlant
}

async function approveSeeding() {
  console.log("Approve Seeding clicked");
  const selectedPlant = carouselItems.value[model.value];
  console.log("Selected Plant:", selectedPlant.title);
  console.log("Checking if planting position is valid..");
  const pos = await transformPixelSeedPositionToMM(farmbotStore.plantPosX, farmbotStore.plantPosY, farmbotStore.personalFieldWidth, farmbotStore.personalFieldHeight);
  const plantingPositionValid = await verifyPlanting(pos.x, pos.y);
  console.log("Planting position valid:", plantingPositionValid);
  console.log("Planting position:", pos.x, pos.y);

  const plants = farmbotStore.plantedPlants.filter(
    (point: { x: any; y: any }) =>
      point.x <= farmbotStore.xUpperBorder &&
      point.x >= farmbotStore.xBorder &&
      point.y <= farmbotStore.yUpperBorder &&
      point.y >= farmbotStore.yBorder
  );

  if (plants.length >= plantLimit) {
    showCard("You have reached the maximum number of plants on your field. FarmBot will not plant any more seeds.");
    ConnectionStore.logAction("seeding", { plant: selectedPlant.title, success: false });
    resetPositionForPlanting(farmbotStore);
    return;
  }


  if(plantingPositionValid){
    showCard("FarmBot is now planting");
    plantSelectedPlant(
      selectedPlant.title,
      pos.x,
      pos.y,
      25
    ); 
    farmbotStore.togglePlantingActive();
    ConnectionStore.logAction("seeding", { plant: selectedPlant.title, success: true });
  }
  resetPositionForPlanting(farmbotStore);
  farmbotStore.resyncRequired = !farmbotStore.resyncRequired;
}

async function searchValidPosition() {
  // let validPosition_x = getRandomValue(farmbotStore.xBorder, farmbotStore.xUpperBorder);
  // let validPosition_y = getRandomValue(farmbotStore.yBorder, farmbotStore.yUpperBorder);
  // while (checkIfPlantIsTooCloseToAnotherPlant(x, y, 25)) {
  //   console.log("Planting position is too close to another plant. Searching for new position..");
  //   x = getRandomValue(farmbotStore.xBorder, farmbotStore.xUpperBorder);
  //   y = getRandomValue(farmbotStore.yBorder, farmbotStore.yUpperBorder);
  // }
  // const transformedPosition = await transformPixelSeedPositionToMM(validPosition_x, validPosition_y, viewport_width.value, viewport_height.value);


  let gridLowerX = farmbotStore.xBorder +50;
  let gridUpperX = farmbotStore.xUpperBorder -50;
  let gridWidth = gridUpperX - gridLowerX;
  let gridStepX = gridWidth / 4;

  let gridLowerY = farmbotStore.yBorder + 50;
  let gridUpperY = farmbotStore.yUpperBorder - 50;
  let gridHeight = gridUpperY - gridLowerY;
  let gridStepY = gridHeight / 4;
  
  const plants = farmbotStore.plantedPlants.filter(
    (point: { x: any; y: any }) =>
      point.x <= farmbotStore.xUpperBorder &&
      point.x >= farmbotStore.xBorder &&
      point.y <= farmbotStore.yUpperBorder &&
      point.y >= farmbotStore.yBorder
  );

  const plantCount = plants.length;
  if (plantCount >= plantLimit) return;

  let indexX = Math.floor(plants.length / 4);
  let indexY = plants.length % 4;
  let newX = gridLowerX + indexY * gridStepX + gridStepX/2;
  let newY = gridLowerY  + indexX * gridStepY + gridStepY/2;


  
  farmbotStore.automatedPlantingPoint = { x: getPositioninMM(newX, farmbotStore.myI, farmbotStore.myJ, bedWidth, bedHeight, 1), y: getPositioninMM(newY, farmbotStore.myI, farmbotStore.myJ, bedWidth, bedHeight, 2) };
  console.log("PX position:", farmbotStore.automatedPlantingPoint);
  console.log("MM position:", newX, newY);
  return { x: newX, y: newY };
}

async function approveSeedingSimple() {
  const selectedPlant = carouselItems.value[model.value];
  showCard(`FarmBot is looking for a suitable position to seed..`);
  farmbotStore.togglePlantingActive();
 
  const validPosition = await searchValidPosition();

  if (!validPosition) {
    showCard(`FarmBot could not find a suitable position to seed. Your field is full.`);
    
  } else {
    showCard(`FarmBot received your planting task and will execute it shortly!`);
    plantSelectedPlant(selectedPlant.title, validPosition.x, validPosition.y, 25); // Todo Radius anstelle von 5
  }

  ConnectionStore.logAction("seedingSimple", { plant: selectedPlant.title, success: validPosition? true : false });
  farmbotStore.resyncRequired = !farmbotStore.resyncRequired;
}

function handleCancel() {
  closeAndResetPopUp();
  const selectedPlant = carouselItems.value[model.value];
  ConnectionStore.logAction("seeding aborted upon warning", { plant: selectedPlant.title });
}

function handleConfirm() {
  closeAndResetPopUp();
  if(interactionLevel == 2){
    const selectedPlant = carouselItems.value[model.value];
    const pos = transformPixelSeedPositionToMM(farmbotStore.plantPosX, farmbotStore.plantPosY, viewport_width.value, viewport_height.value);
    plantSelectedPlant(
      selectedPlant.title,
      pos.x,
      pos.y,
      25
    );
    showCard(`FarmBot received your planting task and will execute it shortly!`);
    ConnectionStore.logAction("seeding despite warning", { plant: selectedPlant.title });
  }
  else{
    const selectedPlant = carouselItems.value[model.value];
    ConnectionStore.logAction("seeding requested but not possible", { plant: selectedPlant.title });
  }
  resetPositionForPlanting();
}

function showPopUp(message, cancelOption) {
  showFarmbotCardPopUp.value = true;
  selectedPopUpMessage = message;
  displayCancel = cancelOption;
}

function closeAndResetPopUp(){
  showFarmbotCardPopUp.value = false;
  selectedPopUpMessage = "";
  displayCancel = false;
}

function showCard(message) {
  showFarmBotCard.value = true;
  selectedPlantMessage.value = message;
}

function closeAndResetCard() {
  showFarmBotCard.value = false;
  selectedPlantMessage.value = "";
}

onMounted(() => { });

</script>

<style scoped>
.v-card.selected-background {
  background-color: rgba(54,
      66,
      45,
      0.6) !important;
  /* Adding !important to enforce precedence */
  opacity: 0.6 !important;
  /* Adding !important to enforce precedence */
}

.v-card.rounded {
  border-radius: 15px;
}
</style>
