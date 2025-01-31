//Returns the sensor values
export default defineEventHandler(async (event) => {
    return farmBotRESTCall('api/sensor_readings', 'GET', { 'content-type': 'application/json' });
   });