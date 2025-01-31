import { getServerSession } from "#auth"

export default eventHandler(async (event) => {

  // Protect all API endpoints inside protected
  if (!event.node.req.url?.startsWith('/api/protected') && !event.node.req.url?.startsWith('/api/prisma') && !event.node.req.url?.startsWith('/api/FarmBot')) {
    return
  }

  //Protect all API endpoints except auth
 /* if (event.node.req.url?.startsWith('/api/auth')) {
    return
  }*/


  const session = await getServerSession(event)
  
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }
})