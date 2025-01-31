export default defineEventHandler(async (event) => {
    const { id } = event.context.params as { id: string };

    return farmBotRESTCall( `/api/point_groups/${id}`, 'GET', { 'content-type': 'application/json' });
   });

