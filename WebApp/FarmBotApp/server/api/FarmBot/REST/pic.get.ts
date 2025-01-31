//Returns the points
export default defineEventHandler(async (event) => {
   // return farmBotRESTCall('api/webcam_feeds', 'GET', { 'content-type': 'application/json' });
    return farmBotRESTCall('api/images', 'GET', { 'content-type': 'application/json' });
   });