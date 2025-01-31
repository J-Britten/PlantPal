//post logs to farmbot
export default defineEventHandler(async (event) => {

    const body = await readBody(event);
    //console.log('body', body);
    const data = await farmBotRESTCall('api/logs', 'POST', { 'content-type': 'application/json' }, body);
    return data;
   });