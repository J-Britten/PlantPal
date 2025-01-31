
/**
 * Creates a new timeline post, is meant to be used by the server, specifically as a callback when a task was executed successfully
 * 
 * @param userName 
 * @param type 
 * @param title 
 * @param text 
 * @param image 
 * @param isPublic 
 * @returns 
 */
export function createTimelinePost(userName: string, type: number, title: string, text: string, image: string, isPublic: boolean) {

  if(process.client) return;

  prisma.timelinePost.create({

    data: {
      title: title,
      text: text,
      image: image,
      type: type,
      public: isPublic,
      userName: userName
    }
  }).then((result) => {
 // console.log('Timeline Post Created', result);
  }).catch((error) => {
 //   console.error('Failed to create timeline post', error);
  });
  
}