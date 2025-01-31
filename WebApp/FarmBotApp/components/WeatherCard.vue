<script lang="ts" setup>
import { ref } from 'vue';
import { useWeatherStore } from '~/stores/weatherStore';


const  weatherStore  = useWeatherStore();
const t = await weatherStore.getWeather()
</script>
<template>
  <v-row>
    <v-col cols="12" class="text-left mt-3 mb-0 pb-0 pl-0">
      <v-card-title>Weather</v-card-title>
    </v-col>
    <v-col cols="12">
      <v-card>

        <v-card-text class="py-0">
         
          <v-row align="center" no-gutters>
            <v-divider></v-divider>
            <v-col class="text-left pa-3" cols="5">
              <v-icon
                color="primary"
                
                size="64"
              >{{ weatherStore.currentWeather.iconName }}</v-icon>
              <v-card-text class="pa-0">{{ weatherStore.currentWeather.description }}</v-card-text>
            </v-col>
            <v-col
              class="text-h2 text-right pa-3"
              cols="7"
            >
              {{ weatherStore.currentTemperature > 25 ? Math.round(weatherStore.currentTemperature - 3) + '°C' :Math.round(weatherStore.currentTemperature) + '°C' }}
            </v-col>      
        <v-divider></v-divider>
        <v-col cols="6" class="pa-3">Today:</v-col>
            <v-col cols="6" class="text-right pa-3">
    {{ Math.round(weatherStore.dailyTemperature.min) }}°C / {{ Math.round(weatherStore.dailyTemperature.max) }}°C <v-icon color="grey-darken-1">mdi-thermometer</v-icon>       
            </v-col>
            <v-col cols="6" class="text-left pl-3">
              <v-icon color="grey-darken-1">{{ weatherStore.dayWeather.iconName }}</v-icon> {{ weatherStore.dayWeather.description }}
            </v-col>
            <v-col cols="6" class="text-right pa-3">{{ weatherStore.dailyPrecipitation }} l/m² <v-icon color="grey-darken-1">mdi-water</v-icon></v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style>

</style>