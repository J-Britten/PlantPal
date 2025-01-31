import type { Milestone, TimelinePost } from '@prisma/client';
import { defineStore } from 'pinia'

/**
 * Stores the Timeline data which consists of private and public posts
 */
export const useTimelineStore = defineStore('timelineStore', () => {
  const publicPosts = ref<TimelinePost[]>([]) // Milestones that are public, may include general announcements
  const userPosts = ref<TimelinePost[]>([]) //Milestones specific to the user
  const { data } = useAuth()

  /**
   * 
   * @returns Fetches the public milestones from the server
   */
  async function fetchPublicPosts() {
    let tmp = -1 // Sending -1 means fetch all the latest 10 as there is no milestone with id -1
    if(publicPosts.value.length > 0) { // If there are already milestones fetched, get the last milestone id
      tmp = publicPosts.value[publicPosts.value.length - 1].id - 1 // shift by 1 to get the next 10, we dont want to fetch the same milestone again
    }
    if(tmp == 0) return; // If the last milestone fetched is the first milestone, then there are no more milestones to fetch
  
    const response = await fetch('/api/prisma/timeline/all/'+tmp);
    let resp = await response.json()
    if(resp.length == 0) return; // If there are no more milestones we return
    publicPosts.value.push(...resp);
  }

  async function fetchPrivatePosts() {
    let tmp = -1
    if(userPosts.value.length > 0) {
      tmp = userPosts.value[userPosts.value.length - 1].id - 1 //
    } 
    if(tmp == 0) return;
    const response = await fetch('/api/prisma/timeline/'+data.value?.user?.name+'/'+tmp);
    let resp = await response.json()
    if(resp.length == 0) return;
    userPosts.value.push(...resp);
  }

/*  async function createPost(milestone: any) {
    const response = await $fetch('/api/prisma/timeline/milestone', {
      method: 'PUT',
      body:  milestone 
    })
    return response
  
  }*/


return {publicPosts, userPosts, fetchPublicPosts, fetchPrivatePosts/*, createPost*/ }
})
