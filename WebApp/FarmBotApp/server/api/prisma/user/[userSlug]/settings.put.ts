//post new plants to farmbot


export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { userSlug } = event.context.params as { userSlug: string };

  let interactionLevel : number = Number(body.interactionLevel);
  let accountActivated : boolean= Boolean(body.accountActivated);
  //find first usersettings or create new one that matches the userSlug
  const settings = await prisma.userSettings.update({
    where: {
      username: userSlug,
    },
    data: {
      interactionLevel: interactionLevel,
      accountActivated: accountActivated
    },
  });

  return settings;
});