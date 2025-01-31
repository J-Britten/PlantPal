import { Milestone } from "@prisma/client"

/**
 * Create a new Milestone, all data is in the body. See the Milestone type for more information
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event); // Get the milestone data from the request body
  const newMilestone = await prisma.milestone.create({
    data: body,
  });
  
  return newMilestone;
})