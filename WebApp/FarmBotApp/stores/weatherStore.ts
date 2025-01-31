import { defineStore } from 'pinia'


const codeMappings: { [key: number]: { description: string, iconName: string } } = {
  0: { description: 'Clear Sky', iconName: 'mdi-weather-sunny' },
  1: { description: 'Mainly Clear', iconName: 'mdi-weather-partly-cloudy' },
  2: { description: 'Partly Cloudy', iconName: 'mdi-weather-partly-cloudy' },
  3: { description: 'Overcast', iconName: 'mdi-weather-cloudy' },
  45: { description: 'Fog', iconName: 'mdi-weather-fog' },
  48: { description: 'Depositing Rime Fog', iconName: 'mdi-weather-fog' },
  51: { description: 'Light Drizzle', iconName: 'mdi-weather-partly-rainy' },
  53: { description: 'Moderate Drizzle', iconName: 'mdi-weather-partly-rainy' },
  55: { description: 'Dense Drizzle', iconName: 'mdi-weather-partly-rainy' },  
  56: { description: 'Light Freezing Drizzle', iconName: 'mdi-weather-partly-snowy' },
  57: { description: 'Dense Freezing Drizzle', iconName: 'mdi-weather-partly-snowy' },
  61: { description: 'Light Rain', iconName: 'mdi-weather-rainy' },
  63: { description: 'Moderate Rain', iconName: 'mdi-weather-rainy' },
  65: { description: 'Heavy Rain', iconName: 'mdi-weather-rainy' },
  66: { description: 'Light Freezing Rain', iconName: 'mdi-weather-snowy-rainy' },
  67: { description: 'Heavy Freezing Rain', iconName: 'mdi-weather-snowy-rainy' },
  71: { description: 'Light Snow Fall', iconName: 'mdi-weather-snowy' },
  73: { description: 'Moderate Snow Fall', iconName: 'mdi-weather-snowy' },
  75: { description: 'Heavy Snow Fall', iconName: 'mdi-weather-snowy' },
  77: { description: 'Snow Grains', iconName: 'mdi-weather-hail' },
  80: { description: 'Slight Showers', iconName: 'mdi-weather-pouring' },
  81: { description: 'Moderate Showers', iconName: 'mdi-weather-pouring' },
  82: { description: 'Heavy Showers', iconName: 'mdi-weather-pouring' },
  85: { description: 'Slight Snow Showers', iconName: 'mdi-weather-snowy-heavy' },
  86: { description: 'Heavy Snow Showers', iconName: 'mdi-weather-snowy-heavy' }, 
  95: { description: 'Thunderstorm', iconName: 'mdi-weather-lightning' },
  96: { description: 'Thunderstorm with Slight Hail', iconName: 'mdi-weather-lightning' },
  99: { description: 'Thunderstorm with Hail', iconName: 'mdi-weather-lightning' },

  // Add more mappings here...
};


export const useWeatherStore = defineStore('weather', () => {
  const displayToast = inject('displayToast');
  const weatherData : any = ref({})
  const weatherCode = ref(0)
  
  const currentWeather = ref(codeMappings[weatherCode.value] || { description: "Unknown", iconName: "mdi-weather-sunny" });
  const currentTemperature = ref(0)

  const dayWeather = ref(codeMappings[weatherCode.value])
  const dailyTemperature = ref({max: 0, min: 0})
  const dailyPrecipitation = ref(0)
  async function getWeather() {
    
        //the api call can be customized on this page: https://open-meteo.com/en/docs/dwd-api/#current=temperature_2m,weather_code&hourly=&daily=weather_code,precipitation_sum&timezone=Europe%2FBerlin&forecast_days=1
      const response = await fetch('https://api.open-meteo.com/v1/dwd-icon?latitude=48.423811&longitude=9.960611&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe%2FBerlin');
      if (!response.ok) {
        displayToast('Could not get weather data', 'error')
        return;
      }
      weatherData.value = await response.json();
      currentWeather.value = codeMappings[weatherData.value.current.weather_code]
      currentTemperature.value = weatherData.value.current.temperature_2m

      dayWeather.value = codeMappings[weatherData.value.daily.weather_code[0]]
      dailyTemperature.value = {max: weatherData.value.daily.temperature_2m_max[0], min: weatherData.value.daily.temperature_2m_min[0]}
      dailyPrecipitation.value = weatherData.value.daily.precipitation_sum[0]
  }

  //Anything that is returned here can be accessed by other components. Meaning we can also put "private" variables here
  return {  currentWeather, currentTemperature, dayWeather, dailyTemperature, dailyPrecipitation, getWeather }; 
});