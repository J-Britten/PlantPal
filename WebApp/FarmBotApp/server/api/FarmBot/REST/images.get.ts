//Returns the images
export default defineEventHandler(async (event) => {
  return farmBotRESTCall('api/images', 'GET', { 'content-type': 'application/json' });
  });