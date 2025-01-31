import { Farmbot } from 'farmbot';
import { Queue } from 'queue-typescript';

import { FarmBotTask } from '../utils/FarmBotTask';
import { CustomQueue } from '../utils/CustomQueue';
import { ref } from 'vue';
//const { Queue } = require('queue-typescript')
/**
 * FarmBot socket. Ensures that at most one connection to the farmbot is open at any given time.
 * To execute commands on the farmbot, refer to server/utils/farmbotWrapper.ts
 */

const fbot = new Farmbot({ token: useRuntimeConfig().farmbotApi})


export default defineNitroPlugin((nitroApp) => {

    global.farmbotSocket = fbot;
    global.currentJobs = {};
    fbot.on("status", (status : any) => {
        const pos = status.location_data.position;
        //console.log("status")
        if(global.io) {
            global.io.emit('farmbot-position', pos); //global.io is the global socket, we can send messages to all clients this way
        }

        global.currentJobs = status.jobs;
        //console.log("status jobs", currentJobs.value)
      });
 
    fbot.connect().then(() => {
      console.log("Farmbot connected")
    });

    

    
})


export const isFarmBotWorking = (): [boolean, boolean] => {
  // Convert currentJobs.value object to an array of its values

  const jobsArray = Object.values(global.currentJobs);
  
  // Use the some method to check if any job's percent is not 100
  //console.log("current jobs in isfarmbotworking", global.currentJobs)
  //console.log(jobsArray)

  const hasIncompleteJobs = jobsArray.some(job => job.percent != 100);
  
  const hasFailedJobs = jobsArray.some(job => job.status === 'Failed');

  return [hasIncompleteJobs, hasFailedJobs];
};