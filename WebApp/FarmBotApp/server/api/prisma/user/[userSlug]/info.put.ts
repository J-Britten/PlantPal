

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
  
    const { userSlug } = event.context.params as { userSlug: string };
  
    let field = body.field;
    //find first usersettings or create new one that matches the userSlug
    const settings = await prisma.userInfo.upsert({
      where: {
        username: userSlug,
      },
      create: {
        username: userSlug,
        field: field,
      },
      update: {
        field: field,
      },
    });
  
    return settings;
  });