/**
 * Example of a Prisma API route, we use the PrismaClient to fetch a user by slug
 * The slug is passed as a parameter in the URL (which is the name of the file)
 * 
 * We check if the user exists. This is technically still insecure, but it's just an example
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {

const { userSlug } = event.context.params as { userSlug: string };

const user = await prisma.user.findFirst({
    where: {
        name: userSlug,
    },
    include: {
        Team: true,
    }
});

if (!user) {
    throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
    });
}
const reply = {
    name: user.name,
    userId: user.id,
    teamId: user.teamId,
    team: user.Team,
}

  return reply;
});