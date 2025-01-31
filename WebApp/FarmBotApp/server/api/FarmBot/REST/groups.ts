//Returns the points
export default defineEventHandler(async (event) => {
    return farmBotRESTCall('api/point_groups', 'GET', { 'content-type': 'application/json' });
   });