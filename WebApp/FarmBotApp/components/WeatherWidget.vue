<script lang="ts" setup>
import { ref } from 'vue';
import { useWeatherStore } from '~/stores/weatherStore';


const  weatherStore  = useWeatherStore();
const t = await weatherStore.getWeather()
</script>
<template>
  <v-card
   
    style="position: absolute; bottom:0"
  >

    <v-card-text class="py-0">
     
      <v-row align="center" no-gutters>
        <v-col cols="12" class="text-h6">Weather</v-col>
        <v-divider></v-divider>
        <v-col class="text-left" cols="6">
          <v-icon
            color="primary"
            
            size="64"
          >{{ weatherStore.currentWeather.iconName }}</v-icon>
          <v-card-text class="pa-0">{{ weatherStore.currentWeather.description }}</v-card-text>
        </v-col>
        <v-col
          class="text-h3 text-right"
          cols="6"
        >
          {{ Math.round(weatherStore.currentTemperature) }}&deg;C
        </v-col>      
    <v-divider></v-divider>
    <v-col
        cols="6"
        >Today:</v-col>
        <v-col cols="6" class="text-right">
{{ Math.round(weatherStore.dailyTemperature.min) }}°C / {{ Math.round(weatherStore.dailyTemperature.max) }}°C <v-icon color="grey-darken-1">mdi-thermometer</v-icon>       
        </v-col>
        <v-col cols="6" class="text-left">
          <v-icon color="grey-darken-1">{{ weatherStore.dayWeather.iconName }}</v-icon> {{ weatherStore.dayWeather.description }}
        </v-col>
        <v-col cols="6" class="text-right">{{ weatherStore.dailyPrecipitation }} l/m² <v-icon color="grey-darken-1">mdi-water</v-icon></v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style>

</style>