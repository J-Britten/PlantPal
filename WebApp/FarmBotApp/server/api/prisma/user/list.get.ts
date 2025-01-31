//get names of all users
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const usernames: any = await prisma.user.findMany({
    select: {
      name: true,
      id: true
    }
  });

  return usernames;
});