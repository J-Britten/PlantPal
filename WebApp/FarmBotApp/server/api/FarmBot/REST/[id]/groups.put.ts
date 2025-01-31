//post new plants to farmbot
export default defineEventHandler(async (event) => {
    const { id } = event.context.params as { id: string };

    const body = await readBody(event);
    //console.log('body', body);
    const data = await farmBotRESTCall(`api/point_groups/${id}`, 'PUT', { 'content-type': 'application/json' }, body);
    return data;
   });