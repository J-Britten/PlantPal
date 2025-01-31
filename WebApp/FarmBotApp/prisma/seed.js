import { PrismaClient } from '@prisma/client';
import { hash } from "bcrypt"
/**
 * This script exists to seed the database with some initial data and is run upon calling 'prisma migrate reset'
 * 
 * 
 * FieldIds:
 * 1:93953
 * 2:94023
 * 3:94024
 * 4:94022
 * 5:97720
 * 6:97721
 * 7:97722
 * 8:97723
 * 9:97724
 * 10:97725
 * 11:97726
 * 12:97727
 * 13:97728
 * 14:97729
 * 15: 97730
 * 16: 97731  
 * 17: 97732
 * 18: 97733
 */


const prisma = new PrismaClient();

function getRandomPassword() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function seed() {
  const userPromises = [];
  const userInfoPromises = [];
  const userSettingsData = [];

  const fieldIds = {
    1: 93953,
    2: 94023,
    3: 94024,
    4: 94022,
    5: 97720,
    6: 97721,
    7: 97722,
    8: 97723,
    9: 97724,
    10: 97725,
    11: 97726,
    12: 97727,
    13: 97728,
    14: 97729,
    15: 97730,
    16: 97731,
    17: 97732,
    18: 97733,
  };

  for (let i = 1; i <= 18; i++) {
    const name = `P${i}`;
    const password = getRandomPassword();
    console.log(`Creating user ${name} with password ${password}`);
    const userPromise = prisma.user.create({
      data: {
        name: name,
        password: await hash(password, 12),
      }
    });

    userPromises.push(userPromise);

    const userInfoPromise = userPromise.then((user) =>
      prisma.userInfo.create({
        data: {
          username: user.name,
          field: i,
          fieldGroupId: fieldIds[i],
        }
      })
    );

    userInfoPromises.push(userInfoPromise);

    userSettingsData.push({ username: name });
  }

  await Promise.all(userPromises);
  await Promise.all(userInfoPromises);

  await prisma.userSettings.createMany({
    data: userSettingsData,
  });
}

try {
  await seed();
  await prisma.$disconnect();
} catch (e) {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
}
