//Returns the points
export default defineEventHandler(async (event) => {
    const { id } = event.context.params as { id: string };

    return farmBotRESTCall(`api/points/${id}`, 'GET', { 'content-type': 'application/json' });
   });