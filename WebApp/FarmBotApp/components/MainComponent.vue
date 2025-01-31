<script setup>
/**
 * This Component serves as the base for the whole app. Right now, it is used on the layout2 page but may later be moved to index
 */
import { useConnectionStore } from "~/stores/clientSocketStore";
import { useFarmbotStore } from "~/stores/farmbotStore";

import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import LiveStreamComponent from "./LiveStreamComponent.vue";
import AboutComponent from "./AboutComponent.vue";

const farmbotStore = useFarmbotStore();
farmbotStore.initalizeField();
farmbotStore.findMyFieldNumber();

const ConnectionStore = useConnectionStore();
let alltodos = ref(0);

//console.log(farmbotStore.waterTodo, 'test4');

// Base Layout
const windowHeight = ref(0);
const windowWidth = ref(0);
const fieldColRef = ref(); // Reference to the first column where the field is located
const fieldColHeight = computed(() => {
  // Height of the first column (farmbot map content goes in there)
  return fieldColRef.value ? fieldColRef.value.$el.clientHeight : 0;
});

const fieldColWidth = computed(() => {
  // Width of the first column (farmbot map content goes in there)
  return fieldColRef.value ? fieldColRef.value.$el.clientWidth : 0;
});

const secondColHeight = computed(() => {
  // Calculate the remaining height of the window for the second column
  return windowHeight.value - fieldColHeight.value - 128; // This is the current offset value based on all the paddings used. May need to be adapted
});

const fullColHeight = computed(() => {
  return windowHeight.value - 128;
});

const updateWindowHeight = () => {
  windowHeight.value = window.innerHeight;
};

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

const mounted = ref(false);
const fieldstate = ref("all"); // This controls whether the field is displayed in full or only the user's field
const currentPage = ref("field"); // This controls what is currently displayed in the second column. If there are conditional components within a page, please handle them in a separate component that groups the components for that page. This is to ensure that the component is not loaded when it is not needed.


onMounted(() => {
  updateWindowHeight();
  updateWindowWidth();
  window.addEventListener("resize", updateWindowHeight);
  mounted.value = true;
});

// Watchers for fieldstate and currentPage
watch(fieldstate, (newValue, oldValue) => {
  ConnectionStore.logAction("fieldViewChange", { new: newValue });
  // Add your logic here that needs to run when fieldstate changes
});

watch(mounted, (newValue, oldValue) => {
  if (newValue) {
    console.log("calling fetch todos from main component");
    farmbotStore.fetchToDos();
  }
});

watch(currentPage, (newValue, oldValue) => {
  ConnectionStore.logAction("pageChange", { new: newValue });
});

watch(farmbotStore.todobadget, (newValue, oldValue) => {
  alltodos.value = newValue;
});


onBeforeUnmount(() => {
  window.removeEventListener("resize", updateWindowHeight);
});

const showAllFields = () => {
  fieldstate.value = "all";
};

const showMyField = () => {
  fieldstate.value = "personal";
};

</script>

<template>
  <v-container
    class="fill-height pt-16 pb-14"
    style="height: 100vh; margin: 0; max-height: 100vh; overflow: hidden"
  >
    <v-row v-if="currentPage === 'chat'" class="fill-height">
      <v-col
        cols="12"
        class="py-2"
        :style="{ maxHeight: fullColHeight + 'px' }"
      >
        <ChatComponent />
      </v-col>
    </v-row>
    <v-row v-else-if="currentPage === 'timeline'" class="fill-height">
      <v-col
        cols="12"
        class="py-2"
        :style="{ maxHeight: fullColHeight + 'px' }"
      >
        <TimelineComponent />
      </v-col>
    </v-row>

    <v-row v-else-if="currentPage === 'settings'" class="fill-height">
      <v-col
        cols="12"
        class="py-2"
        :style="{ maxHeight: fullColHeight + 'px' }"
      >
        <SettingsComponent />
      </v-col>
    </v-row>

    <v-row v-else-if="currentPage === 'report'" class="fill-height">
      <v-col
        cols="12"
        class="py-2"
        :style="{ maxHeight: fullColHeight + 'px' }"
      >
        <ReportIssueComponent />
      </v-col>
    </v-row>

    <v-row v-else-if="currentPage === 'about'" class="fill-height">
      <v-col
        cols="12"
        class="py-2"
        :style="{ maxHeight: fullColHeight + 'px' }"
      >
        <AboutComponent />
      </v-col>
    </v-row>

    <v-row v-else class="fill-height">
      <v-col ref="fieldColRef" cols="12" class="pt-3 px-0">
        <div class="text-center mb-2">
          <v-btn
            variant="elevated"
            @click="showAllFields"
            color="primary"
            rounded
            density="compact"
            class="text-none text-subtitle-1 mr-12"
            :disabled="fieldstate === 'all'"
          >
            Show all fields
        </v-btn>
         
          <v-btn v-if="farmbotStore.userSettings.interactionLevel === 0" 
            variant="elevated"
            color="primary"
            rounded
            density="compact"
            class="text-none text-subtitle-1"
            @click="showMyField"
            :disabled="fieldstate === 'personal'"
          >
            Show my field
          </v-btn>
          <v-badge v-if="farmbotStore.userSettings.interactionLevel > 0" color="error" :content="farmbotStore.todobadget">
            <v-btn
              variant="elevated"
              color="primary"
              rounded
              density="compact"
              class="text-none text-subtitle-1"
              @click="showMyField"
              :disabled="fieldstate === 'personal'"
            >
              Show my field
            </v-btn>
          </v-badge>
        </div>
        <v-col v-if="fieldstate === 'all'" class="mb-n9 pb-0 px-2">
          <D3GlobalMapController />
        </v-col>
        <v-col v-else-if="fieldstate === 'personal'" class="mb-n9 px-4">
          <D3PersonalMapController />
        </v-col>
      </v-col>
      <!-- Second element taking up remaining space and scrollable -->
      <v-col
        cols="12"
        class="py-2 overflow-y-auto overflow-x-hidden"
        :style="{
          maxHeight: secondColHeight + 'px',
          maxWidth: windowWidth + 'px',
        }"
      >
        <div v-if="currentPage === 'field' && fieldstate === 'all'">
          <HomeGlobalFieldComponent />
        </div>
        <div v-else-if="currentPage === 'field' && fieldstate === 'personal'">
          <PersonalFieldViewComponent />
        </div>
        <div v-else-if="currentPage === 'live'">
          <LiveStreamComponent />
        </div>
        <div style="height: 250px"></div>
      </v-col>
    </v-row>
  </v-container>
  <MainTopNavigation v-model="currentPage" />
  <MainBottomNavigation v-model="currentPage" />
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap");
html {
  font-family: "IBM Plex Sans", sans-serif;
}

only-vertical-overflow {
  overflow-x: hidden;
  overflow-y: auto;
}

to-top {
  z-index: 1000;
}
</style>
