//Returns the points

export default defineEventHandler(async (event) => {
   return farmBotRESTCall('api/firmware_config/', 'GET', { 'content-type': 'application/json' });
  });