export default defineEventHandler(async (event) => {
  const {gridId} = event.context.params as {gridId:string};

  if (!gridId) {
    return { error: "gridId is required" };
  }

  try {
    const entries = await prisma.photoGrid.findMany({
      where: {
        gridId: Number(gridId),
      },
    });

    return entries;
  } catch (error) {
    return { error: error.message };
  }
});