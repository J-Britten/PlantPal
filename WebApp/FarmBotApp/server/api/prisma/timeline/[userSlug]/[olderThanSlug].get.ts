import { Milestone, TimelinePost } from "@prisma/client"

export default defineEventHandler(async (event) => {
  
  const { userSlug, olderThanSlug } = event.context.params as {userSlug: string, olderThanSlug: string} 
  //userslug: milestones of a specific username, all means all milestones that are public
  //olderthanslug: the id-1 of the last milestone fetched, ensures we dont fetch the same milestones again

  let milestones : TimelinePost[] = []

  let findOptions = {
    take: -20, // Take the last 10 records. We only load 10 to ensure the page loads faster, we dont want to load all milestones at once
   /* orderBy: { //This did not work, so we are using the reverse method to reverse the array
      createdAt: 'desc', // Assuming you have a createdAt field
    },*/
  };

  if(userSlug == "all") {
    findOptions.where = {
      public: true,
    }
  } else {
    findOptions.where = {
      userName: userSlug ,
    }
  }

  if (olderThanSlug != -1) {
    findOptions.cursor = {
      id: parseInt(olderThanSlug), // Assuming you want to start at a certain id
    };
  }




  milestones = await prisma.timelinePost.findMany(findOptions)
  
  
  return milestones.reverse()	// Return the milestones in reverse order, we reverse to ensure the oldest milestone is at the end


})
