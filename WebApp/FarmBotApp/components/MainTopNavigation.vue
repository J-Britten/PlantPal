<script setup lang="ts">
const { data, signOut } = useAuth()
const route = useRoute()

const drawer = ref(false)

const pageTitle = computed(() => { //this gets the title of the current page this component is used. For it to work the page must have a definePageMeta function that defines the title
  return route.meta.title;
});

const router = useRouter();

const goToAbout = () => {
  model.value = 'about';
};

const goToSettings = () => {
  model.value = 'settings';
};

const goToReport = () => {
  model.value = 'report';
};

const model = defineModel()



const titleMappings = {
  'field': 'The PlantPal Field',
  'live': 'The PlantPal Live View',
  'timeline': 'The PlantPal Timeline',
  'chat': 'Chat',
  'settings': 'PlantPal Settings',
  'report': 'Report an Issue',
  'about': 'About PlantPal'
}


</script>

<template>
  <!-- <v-system-bar color="deep-purple darken-3"></v-system-bar> -->

  <v-app-bar color="primary" prominent v-if="data?.user" rounded="xl" density="comfortable"
    style="width: calc(100% - 16px); left: 8px; top: 8px;">
    <v-menu>
      <template v-slot:activator="{ props }">
      <v-btn style="margin-left: 4px;" icon="mdi-menu" variant="text" v-bind="props" ></v-btn>
    </template>
      <v-list rounded="xl" density="compact" nav style="top: 8px">
        <v-list-item prepend-icon="mdi-cog-outline" title="Settings" value="settings"
          @click="goToSettings()"></v-list-item>
        <v-list-item prepend-icon="mdi-school" title="About" value="about" @click="goToAbout()"></v-list-item>
        <v-list-item prepend-icon="mdi-comment-alert" title="Report an Issue" value="report"
          @click="goToReport()"></v-list-item>
        <v-list-item prepend-icon="mdi-logout" title="Logout" value="logout"
          @click="signOut({ callbackUrl: '/auth/login' })"></v-list-item>
      </v-list>
    </v-menu>
    <v-toolbar-title class="text-center" style="margin-left:0; margin-right:52px;" v-text="titleMappings[model]"></v-toolbar-title>
  </v-app-bar>
  <!--<v-navigation-drawer
    v-model="drawer"
    temporary
    color="background"
  >
    <v-list-item
      :title="'Hello ' + data?.user?.name + '!'" 
    ></v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-cog-outline" title="Settings" value="settings"  @click="goToSettings()"></v-list-item>
      <v-list-item prepend-icon="mdi-school" title="About" value="about" @click="goToAbout()" ></v-list-item>
      <v-list-item prepend-icon="mdi-comment-alert" title="Report an Issue" value="report" @click="goToReport()" ></v-list-item>
      <v-list-item prepend-icon="mdi-logout" title="Logout" value="logout" @click="signOut({ callbackUrl: '/auth/login' })"></v-list-item>
    </v-list>
  </v-navigation-drawer>-->


</template>
