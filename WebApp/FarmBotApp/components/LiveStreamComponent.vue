<template>
  <v-row>
    <v-col cols="12" class="iframe-container text-center">         
      
        <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn
          icon
          class="toggle-menu-btn"
          v-bind="props"
        >          <v-icon>mdi-video</v-icon></v-btn>
    </template>
    <v-card>
        <v-tabs :hide-slider="true"
      v-model="tab"
      direction="vertical"
     
    >
      <v-tab class="text-capitalize" :value=1>Birdseye View</v-tab>
      <v-tab class="text-capitalize" :value=2>Side View</v-tab>
      <v-tab class="text-capitalize" :value=3>Center View</v-tab>
    </v-tabs>
  </v-card>
    </v-menu>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item v-if="tab === 1">
          <iframe src="STREAM IP 1" frameborder="0" class="iframe"></iframe>
        </v-tabs-window-item>

        <v-tabs-window-item v-if="tab === 2">
          <iframe src="STREAM IP 2" frameborder="0" class="iframe"></iframe>
        </v-tabs-window-item>

        <v-tabs-window-item v-if="tab === 3">
          <iframe src="STREAM IP 3" frameborder="0" class="iframe"></iframe>
        </v-tabs-window-item>
      </v-tabs-window>

    </v-col>
  </v-row>
</template>

<script lang="ts" setup>

const tab = ref(1)


</script>

<style>
.iframe-container {
  position: relative;
  overflow: hidden;
}

.iframe {
  width: 100%;
  height: 50vh; /* 50% of the viewport height */
  border: none;
}


.toggle-menu-btn {
  position: absolute;
  top: 4px;
  right: 0px;
  z-index: 100;
}
</style>
