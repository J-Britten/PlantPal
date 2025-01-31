import { useScheduler } from "#scheduler";

import { FarmBotTask } from "../utils/FarmBotTask";
import { CustomQueue } from "../utils/CustomQueue";

import { mowWeedsSequence } from "../utils/lua/mowWeeds";
import { waterPlantsSequence } from "../utils/lua/waterPlants";
import { createTimelinePost } from "../utils/timelineManager";
import { safe_mounting } from "../utils/lua/safe_mounting";
import { dismount } from "../utils/lua/dismount";
import { buildPhotoGrid } from "../utils/photoGridBuilder";

import fs from "fs";
import { isFarmBotWorking } from "./farmBotSocket";
const scheduler = useScheduler();

const directoryPath = useRuntimeConfig().photoGridPath;


let minTemperature = 0;
let maxTemperature = 28;
let currentTemperature = 0;

let temperatureWithinBounds = true;

/**
 * 
 * FarmBot Task Manager Plugin
 * 
 * This plugin is responsible for managing the FarmBot Task Queue
 * 
 */
export default defineNitroPlugin(async (nitroApp) => {
    console.log(`[${getCurrentTime()}] Starting FarmBot Task Manager`);
    global.FarmBotTaskQueue = new CustomQueue<FarmBotTask>();
    global.CurrentTask = null;

    if (!fs.existsSync(directoryPath)) { //Depending on where the app is run from, this directory might not exist and thus needs to be created. In it, all the photoGrid images are stored
        fs.mkdirSync(directoryPath, { recursive: true });
        buildPhotoGrid(false);
       
    }

    // buildPhotoGrid(true);

    scheduleMaintenanceTasks();

    scheduleFullAutomationTasks();

    await determineTemperature(); //initial fetch

    setInterval(async () => {
        if (!global.farmbotSocket) return;

        if(!temperatureWithinBounds)  { 
            return;
        } //Make sure the robot doesnt work in extreme temperatures

        let busy = isFarmBotWorking();
        //console.log("Farmbot is busy: ", busy);
        if (!busy[0]) { // if there are no jobs running (all jobs are at 100%)
            //    console.log("Task Manager: ", "Farmbot is not busy")
            if (global.CurrentTask === null) {
                const nextTask = global.FarmBotTaskQueue.dequeue();
                if (nextTask) {
                    console.log(`[${getCurrentTime()}] Task Manager: `, "Executing next Task", nextTask)
                    global.CurrentTask = nextTask;
                    nextTask.task()
                    nextTask.emit();
                }
            } else {
                if (!busy[1]) {//if no failed jobs
                    console.log(`[${getCurrentTime()}] Task Manager: `, "Task Complete", global.CurrentTask.taskName)
                    global.CurrentTask.onTaskComplete();

                } else {
                    console.log(`[${getCurrentTime()}] Task Manager: `, "Task Failed", global.CurrentTask.taskName)

                    createTimelinePost(global.CurrentTask.taskOwner, 1, "Task Failed", `Your scheduled task \"${global.CurrentTask.taskName}\" has failed! If this is a reoccuring error, please report this issue to us!`, "", false);
                }
                global.CurrentTask = null;

                if (global.FarmBotTaskQueue.length == 0) {
                    if(global.io) {
                    global.io.emit('farmbot-current-task', {});
                    }
                }
            }
        } else {
            //console.log("Task Manager: ", "Farmbot is busy")
        }
    }, 10000); //every 10 seconds is plenty

    setInterval(determineTemperature, 60000); 

})

function cleanUp() {
    let goHomeTask = new FarmBotTask(() => global.farmbotSocket.execSequence(392369), "Go Home", "Maintenance", () => {
        console.log('Go Home Task complete');
    });

    global.FarmBotTaskQueue.enqueue(goHomeTask);

}

async function determineTemperature() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=48.423811&longitude=9.960611&current=temperature_2m&timezone=Europe%2FBerlin');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        currentTemperature = data.current.temperature_2m;

        if (currentTemperature< minTemperature || currentTemperature > maxTemperature) {
            temperatureWithinBounds = false;
            console.log(`[${getCurrentTime()}] Task Manager: `, "Temperature is too extreme for FarmBot to work. Current Temperature: ", currentTemperature);
        } else {
            temperatureWithinBounds = true;
        }

    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}


/**
 * Schedules the General Maintenance Tasks that the FarmBot performs fall all users no matter their automation level
 */
function scheduleMaintenanceTasks() {

    scheduler.run(() => {
        console.log(`[${getCurrentTime()}] Task Manager: `,'Daily 6 AM Scheduling ');
        // let measureMoistureTask = new FarmBotTask(() => global.farmbotSocket.execSequence(197052), "Measure Moisture", "FarmBot", () => console.log('Measure Moisture Task complete'));
        // global.FarmBotTaskQueue.enqueue(measureMoistureTask);
        let photoGridTask = new FarmBotTask(() => global.farmbotSocket.execSequence(164188), "Photo Grid", "Maintenance", () => {
            console.log(`[${getCurrentTime()}] Task Manager: `, "Photo Grid Complete");
            buildPhotoGrid(false);
            cleanUp();
        
        }); //photoGridTagging belongs here
        global.FarmBotTaskQueue.enqueue(photoGridTask);
    }).dailyAt(6, 30);

    scheduler.run(() => {  
        console.log(`[${getCurrentTime()}] Task Manager: `, 'Turn off lights');
     /*   let lightOn = new FarmBotTask(() => global.farmbotSocket.execSequence(209612), "Light Off", "Maintenance", () => {
            console.log('Light Off Task complete');
        });*/

       // global.FarmBotTaskQueue.enqueue(lightOn);

       global.farmbotSocket.execSequence(209612)
    }).dailyAt(2, 0);

    scheduler.run(() => {  
      //  console.log(`[${getCurrentTime()}] Task Manager: `, 'Turn on lights');
      //  let lightOn = new FarmBotTask(() => global.farmbotSocket.execSequence(209613), "Light On", "Maintenance", () => {
      //      console.log('Light On Task complete');
      //  });
       // global.FarmBotTaskQueue.enqueue(lightOn);
       global.farmbotSocket.execSequence(209613)
    }).dailyAt(20, 50);


    // scheduler.run(() => {
    //     console.log('Weekly 7 AM Scheduling - Detect Weeds');
    //     let detectWeedsTask = new FarmBotTask(() => global.farmbotSocket.execSequence(164189), "Detect Weeds", "Maintenance", () => {
    //         console.log('Detect Weeds Task complete');
    //         createTimelinePost("FarmBot", 0, "Weed Detection", "Weekly Weed detection was performed! Check your field for weeds!", "", true);
    //     });
    //     global.FarmBotTaskQueue.enqueue(detectWeedsTask);
    // }).cron('0 7 */3 * *');
}


function scheduleFullAutomationTasks() {
    scheduler.run(async () => {
        console.log(`[${getCurrentTime()}] Task Manager: `, 'Daily 6 PM Automation Task Scheduling')
        let allUsers = await prisma.user.findMany({
            select: {
                name: true,
                id: true,
                teamId: true
            }
        });


        // let mowingTasks: FarmBotTask[] = []
        let wateringTasks: FarmBotTask[] = []
        for (let user of allUsers) {
            try {
                let interaction = await prisma.userSettings.findFirst({
                    where: {
                        username: user.name,
                    },
                });

                if (interaction !== null && interaction.interactionLevel == 0) {
                    const personalfield = await prisma.userInfo.findFirst({
                        where: {
                            username: user.name,
                        },
                    });
                    if (personalfield) {
                        let id = personalfield.fieldGroupId;

                        // let mowingScript = mowWeedsSequence(id);

                        // let task = new FarmBotTask(() => global.farmbotSocket.lua(mowingScript), "Mowing Weeds", user.name, () => {
                        //     console.log('Mowing Weeds Task complete'),
                        //         createTimelinePost(user.name, 0, "Weed Mowing", "Weeds were mowed down! Field is clean now!", "", false);
                        // });
                        // mowingTasks.push(task);

                        let wateringScript = waterPlantsSequence(id);
                        wateringTasks.push(new FarmBotTask(() => global.farmbotSocket.lua(wateringScript), "Watering Plants", user.name, () => {
                            console.log('Watering Plants Task complete'),
                                createTimelinePost(user.name, 0, "Watering", "Plants were watered! Field is hydrated now!", "", false);

                        }));

                    }
                }

            } catch (error) {
                console.error(`Failed to fetch interaction settings for user ${user.name}:`, error);
            }
        }

        // if (mowingTasks.length > 0) {
        //     let safemounting = safe_mounting('Rotary Tool');
        //     let task = new FarmBotTask(() => global.farmbotSocket.lua(safemounting), "Mounting Tool", "System", () => console.log('Mounting Tool complete'));
        //     global.FarmBotTaskQueue.enqueue(task);

        //     for (let task of mowingTasks) {
        //         global.FarmBotTaskQueue.enqueue(task);
        //     }

        //     let dismounting = dismount('Rotary Tool');
        //     let dismountRotary = new FarmBotTask(() => global.farmbotSocket.lua(dismounting), "Dismounting Tool", "Maintenance", () => console.log('Dismounting Tool complete'));
        //     global.FarmBotTaskQueue.enqueue(dismountRotary);

        // }
        // if (wateringTasks.length > 0) {
          //  let safemounting2 = safe_mounting('Watering Nozzle');
          //  let task2 = new FarmBotTask(() => global.farmbotSocket.lua(safemounting2), "Mounting Tool", "System", () => console.log('Mounting Tool complete'));
          //  global.FarmBotTaskQueue.enqueue(task2);


            for (let task of wateringTasks) {
                global.FarmBotTaskQueue.enqueue(task);
            }
           // let dismountingw = dismount('Watering Nozzle');
           // let dismountWater = new FarmBotTask(() => global.farmbotSocket.lua(dismountingw), "Dismounting Tool", "Maintenance", () => console.log('Dismounting Tool complete'));
           // global.FarmBotTaskQueue.enqueue(dismountWater);
        // }

    }).dailyAt(18, 0);

}


function enqeueTestTasks() {
    let test = new FarmBotTask(
        () => global.farmbotSocket.execSequence(209613),
        "Turn on light", "Test",
        () => {
            console.log('Test 1 Task Callback');
            createTimelinePost("FarmBot", 0, "Test Post", "Light was turned on!", "https://www.abc.net.au/reslib/200806/r261775_1090070.jpg", true);
        }
    )
    let test2 = new FarmBotTask(() => global.farmbotSocket.execSequence(209612), "Turn off light", "Test", () => console.log('Test 2 Task Callback'));

    global.FarmBotTaskQueue.enqueue(test);
    global.FarmBotTaskQueue.enqueue(test2);

}

// Helper function to get the current time as a formatted string
function getCurrentTime() {
    const now = new Date();
    return now.toISOString(); // You can format this as needed
}