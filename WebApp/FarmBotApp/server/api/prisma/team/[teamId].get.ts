/**
 * Example of a Prisma API route, we use the PrismaClient to fetch a user by slug
 * The slug is passed as a parameter in the URL (which is the name of the file)
 * 
 * Of course passing the user to the client like this is not secure, but it's just an example
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
const { teamId } = event.context.params as { teamId: string};

const team = await prisma.team.findFirst({
    where: {
        id: parseInt(teamId)
    },
});

if (!team) {
    throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
    });
}

  return team;
});