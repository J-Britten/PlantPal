export default defineEventHandler(async (event) => {

    const { userSlug } = event.context.params as { userSlug: string };
    
    const settings = await prisma.userInfo.findFirst({
        where: {
            username: userSlug,
        },
    });
    
      return settings;
    });