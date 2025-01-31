//Returns the points
export default defineEventHandler(async (event) => {
   return farmBotRESTCall('api/points', 'GET', { 'content-type': 'application/json' });
  });