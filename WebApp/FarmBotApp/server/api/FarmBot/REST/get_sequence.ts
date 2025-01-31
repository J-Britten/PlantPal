//Returns the current available sequences

export default defineEventHandler(async (event) => {
    return farmBotRESTCall('api/sequences', 'GET', { 'content-type': 'application/json' });
   });