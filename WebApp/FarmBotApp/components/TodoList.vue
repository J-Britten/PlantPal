<script lang="ts" setup>
import { ref } from 'vue';
import { useFarmbotStore } from '../stores/farmbotStore';
import { useConnectionStore } from '../stores/clientSocketStore';
let todos = ref(true);
const farmbotStore = useFarmbotStore();

const ConnectionStore = useConnectionStore();

</script>
<template>
  
  <v-card v-if=" todos" class="mx-auto my-8" elevation="0" max-width="200" style="z-index: 2;  position: absolute; left: 0; top: 25%;">
    <v-card-item>
        <!-- Zurückpfeil oben rechts -->
      <!--  <v-icon @click="todos = false" style="cursor: pointer;">mdi-arrow-left</v-icon>-->
        
        <!-- Überschrift "Todo" -->
        <v-card-title  >Todos
            <!-- Badge neben der Überschrift -->
            <v-badge v-if=" todos "color="error" :content="farmbotStore.todobadget" inline style="z-index: 3;"></v-badge>
        </v-card-title>
    </v-card-item>
    
    <v-card-text>
      <div v-if="farmbotStore.waterTodo.value >0 ">Water
       <!-- <v-badge v-if="farmbotStore.userSettings.interactionLevel <2" color="error" content="1" inline style="z-index: 3;"></v-badge>  -->
        <v-badge  color="error" :content="farmbotStore.waterTodo.value"  inline style="z-index: 3;"></v-badge>  
      </div>
      <div v-if="farmbotStore.weedTodo.value >0">Weed
       <!-- <v-badge v-if="farmbotStore.userSettings.interactionLevel <2"  color="error" content="1"  inline style="z-index: 3;"></v-badge>  -->
        <v-badge   color="error" :content="farmbotStore.weedTodo.value"  inline style="z-index: 3;"></v-badge>  
      </div>
      <div > Queue:
        <div v-for="(item, index) in ConnectionStore.queue" :key="index" inline style="z-index: 3;">
          {{ item }}
        </div>
      </div>
    </v-card-text>
 <!--   <v-btn v-if=" farmbotStore.todobadget >0" class="text-none" stacked @click="todos = true" style="position: absolute; top: 10%; z-index: 1; width: 10px;">
      <v-badge color="error" :content="farmbotStore.todobadget">
        <v-icon>mdi-store-outline</v-icon>
      </v-badge>
    </v-btn>-->

    
  </v-card>
</template>

<style>

</style>