/**
 * FarmbotWrapper class
 * It allows us to call our single instance farmbot connection from anywhere in the server, e.g. directly in the socket middleware
 */

//TODO: Testen, 
//TODO: SoilMeasuremnet bei Pflanze mit Offset
//TODO: toggle number for Soil measuremnet
//TODO: function to water current amount?
//TODO: checking if moving is legal


/** Id für Field 1: 93953
 * Field 2:94023
 * Field3: 94024
 * Field4: 94022
 */
import { waterPlantsSequence } from "../utils/lua/waterPlants";
import { plantingSequence } from "../utils/lua/planting";
import { waterSelectedSeq } from "../utils/lua/waterSelectedPlants";
import { hackSeq } from "../utils/lua/hack";
import { rotarySeq } from "../utils/lua/rotary";
import { safe_mounting } from "./lua/safe_mounting";
import { findhome } from "./lua/findhome";
import { moveHome } from "./lua/gohome";


class FarmbotWrapper {

    constructor() {
        if (!global.farmbotSocket) throw new Error('Farmbot socket not found');
        this.farmbotSocket = global.farmbotSocket;
        this.instruction_queue = global.instruction_queue;
        this.FarmBotTaskQueue = global.FarmBotTaskQueue;
    }




    async moveZAxisHome() {
        await this.farmbotSocket.home({ axis: "z", speed: 100 });

    }
    async getTool(name: string, x: any, y: any, z: any, plant: string) {
        await this.moveZAxisHome();
        switch (name) {
            case 'weeder':
                await this.weed(y, z);
                break;
            case 'seeder':
                await this.planting(plant, x, y, z, plant);
                break;
            case 'water':
                //await this.waterone(x, y, 0);
                break;
            case 'rotary':
                await this.rotary(x);
                break;

        }

    }

    //Soon to be removed
    async weed(x: any, y: any) {

        let sequence2 = `global.farmbotSocket.execSequenceCustom(197349, [
            {
                kind: "axis_overwrite",
                args:{
                    axis: "x",
                    axis_operand: { kind: "numeric", args: { number: ${x} } }
                }
            },
            {
                kind: "axis_overwrite",
                args:{
                    axis: "y",
                    axis_operand: { kind: "numeric", args: { number: ${y} } }
                }
            },
            {
                kind: "axis_overwrite",
                args:{
                    axis: "z",
                    axis_operand: { kind: "numeric", args: { number: -200 } }
                }
            }
        
         ])`;
        //this.instruction_queue.enqueue(sequence2);
        this.instruction_queue.enqueue({ instruction: sequence2, additionalName: `Weed` });

    }
    //Soon to be removed
    async rotary(id: any) {

        const luascript = `  rotary_tool_pin = 3 -- 2 for REV
max_load = tonumber(env("rotary_tool_max_load")) or 90
rotary_tool_height = tonumber(env("rotary_tool_height")) or 80
max_attempts = tonumber(env("rotary_tool_max_attempts")) or 3
weeds = {}
count = 0
function job(status, percent)
set_job_progress("Mowing weed at " .. coords, {
status = status,percent = percent,time = job_time})
end
pjob_time = os.time() * 1000
function pjob(status, percent)
set_job_progress("Mowing " .. #weeds .. " weeds", {status = status,percent = percent,time = pjob_time
})
end
watcher = function(data)
    if (data.value > max_load) and (env("load") ~= "stalled") then
env("load", "stalled")
soft_stop()
off(rotary_tool_pin)
toast("Rotary tool max load exceeded (load = " .. data.value .. ")", "warn")
end
end
function attempt_weeding()
attempts = attempts + 1
env("load", "nominal")
job("Moving to weed", 10)
move{
x = weed.x - (weed.radius + 50),y = weed.y,
z = weed.z + rotary_tool_height + 20,safe_z = true}on(rotary_tool_pin)
if env("load") == "stalled" then
wait(1500)
return
end
job("Descending", 40)
move{z = weed.z + rotary_tool_height,
speed = 25}
if env("load") == "stalled" then
wait(1500)
return
end
job("Mowing", 50)
move{
x = weed.x + (weed.radius + 50),
speed = 25
}if env("load") == "stalled" then
wait(1500)
return
end
job("Ascending", 90)
move{z = weed.z + rotary_tool_height + 20,
speed = 25}if env("load") == "stalled" then
wait(1500)
return
end
off(rotary_tool_pin)
success = true
end
if not verify_tool() then
return
end
local plant_id = ${id}
local points = api({
method = "GET",
url = "/api/points/"..plant_id})

if not points then
    send_message("error", "Failed to fetch point with ID ", "toast")
    return
end
   table.insert(weeds, {x = points.x, y = points.y, z = soil_height(points.x, points.y), radius = points.radius})

watch_pin(60, watcher)
for k, v in pairs(weeds) do
weed = v
count = count + 1
job_time = os.time() * 1000
pjob("Mowing weed " .. count .. " of " .. #weeds, count / (#weeds + 1) * 100)
coords = "(" .. weed.x .. ", " .. weed.y .. ", " .. weed.z .. ")"
attempts = 0
success = false
while (attempts < max_attempts) and (success == false) do
attempt_weeding()end
if env("load") == "stalled" then
toast("Mowing weed at " .. coords .. " failed after " .. attempts .. " attempt(s); proceeding...", "warn")
end
job("Complete", 100)
end
pjob("Complete", 100)
toast("Mowing complete", "success")`;
        let sequence = `global.farmbotSocket.lua(\`${luascript}\`)`;
        let sequence2 = `global.farmbotSocket.execSequence(207704)`;
        let sequence3 = `global.farmbotSocket.execSequence(164180)`;

        /*  let sequence =  `global.farmbotSocket.execSequenceCustom(197321, [
              {
                  kind: "lua",
                  args:{
                      id:${id} 
                  }
              }
          
           ])`; 
      
           let sequence1 =  `global.farmbotSocket.execSequence(197321, [
              {
                  kind: "parameter_application",
                  label: "id",
                  data_value: {
                    kind: "numeric",
                    args: {
                      id: ${id} 
                    }
                  }
              }
          
           ])`; */
        //this.instruction_queue.enqueue(sequence1);
        this.instruction_queue.enqueue({ instruction: sequence2, additionalName: `Mounting tool ` });
        this.instruction_queue.enqueue({ instruction: sequence, additionalName: `Using Rotary Tool ` });
        this.instruction_queue.enqueue({ instruction: sequence3, additionalName: `Returning Rotary Tool ` });

        console.log('rotary');


    }
    //soon removed
    /*   async waterone(x: any, y: any, z: any) {
   
           let sequence2 = `global.farmbotSocket.execSequenceCustom(164185, [
               {
                   kind: "axis_overwrite",
                   args:{
                       axis: "x",
                       axis_operand: { kind: "numeric", args: { number: ${x} } }
                   }
               },
               {
                   kind: "axis_overwrite",
                   args:{
                       axis: "y",
                       axis_operand: { kind: "numeric", args: { number: ${y} } }
                   }
               },
               {
                   kind: "axis_overwrite",
                   args:{
                       axis: "z",
                       axis_operand: { kind: "numeric", args: { number: 0 } }
                   }
               }
           
            ])`;
           //this.instruction_queue.enqueue(sequence2);
           this.instruction_queue.enqueue({ instruction: sequence2, additionalName: `Water ` });
   
   
       }*/
    async planting(plantname: string, x_pos: any, y_pos: any, z_pos: number, name: string) {

        let plantBinPosition = {x: x_pos, y: y_pos, z: z_pos};


        let plantingScript = plantingSequence(plantBinPosition);
        let safemounting = safe_mounting('Seeder');
        let dismounting = dismount('Seeder');
        let combinedSequence = plantingScript;
        let task =  new FarmBotTask(() => global.farmbotSocket.lua(combinedSequence), "Planting Plants", name, () => {
            createTimelinePost(name, 0, "Planting", `Your ${plantname} was successfully planted!`, "", false);
            
        });
        

        global.FarmBotTaskQueue.enqueue(task);

       // console.log('plantBinPosition', plantBinPosition);


    }



    //**Waters all Plants of the selected field per fieldid */
    async waterAll(id: any, name: string) {
        console.log('watering all sequence starting');
        let wateringScript = waterPlantsSequence(id);
        let safemounting = safe_mounting('Watering Nozzle');
        let dismounting = dismount('Watering Nozzle');
        //let combinedSequence = safemounting + "\n\n" + wateringScript + "\n\n" + dismounting; 
        let combinedSequence = wateringScript;
        let task = new FarmBotTask(() => global.farmbotSocket.lua(combinedSequence), "Watering Plants", name, () => {
            createTimelinePost(name, 0, "Watering", "Your plants were successfully watered!", "", false);
            
        });

        global.FarmBotTaskQueue.enqueue(task);

    }
    //**Waters all selected Plants per Plantid */
    async waterAllofList(data: any[], name: string) {

        let wateringScript = waterSelectedSeq(data);
        // let safemounting = safe_mounting('Watering Nozzle');
        //let combinedSequence = safemounting + "\n\n" + wateringScript; 
        let combinedSequence = wateringScript;
        let task =  new FarmBotTask(() => global.farmbotSocket.lua(combinedSequence), "Watering Plants",name, () => {createTimelinePost(name, 0, "Watering", "Your plants were successfully watered!", "", false)});
    
        global.FarmBotTaskQueue.enqueue(task);

    }
    async hackSelected(data: any[], name: string, type:any) {

        let hackscript = hackSeq(data);
        let safemounting = safe_mounting(type);
        let combinedSequence = safemounting + "\n\n" + hackscript; 
      let task=  new FarmBotTask(() => global.farmbotSocket.lua(combinedSequence), "hacking Weeds",name, () => {
        createTimelinePost(name, 0, "Weeding", "The weeds on your field were successfully hacked!", "", false)});
    
        global.FarmBotTaskQueue.enqueue(task);

    }

    async rotarySelected(data: any[], name: string) {

        let rotary = rotarySeq(data);
        let safemounting = safe_mounting('Rotary Tool');
        let combinedSequence = safemounting + "\n\n" + rotary; 
    
      let task=  new FarmBotTask(() => global.farmbotSocket.lua(combinedSequence), "cutting Weed",name, () => {
        createTimelinePost(name, 0, "Weeding", "The weeds on your field were successfully cut!", "", false)});
    
        global.FarmBotTaskQueue.enqueue(task);
        
    
    }

    //Still in use ?
    async fertilize(x: any, y: any) {

        /* let sequence = `global.farmbotSocket.execSequenceCustom(209570, [
     {
         kind: "axis_overwrite",
         args:{
             axis: "x",
             axis_operand: { kind: "numeric", args: { number: ${x} } }
         }
     },
     {
         kind: "axis_overwrite",
         args:{
             axis: "y",
             axis_operand: { kind: "numeric", args: { number: ${y} } }
         }
     },
     {
         kind: "axis_overwrite",
         args:{
             axis: "z",
             axis_operand: { kind: "numeric", args: { number: -300 } }
         }
     }
 
  ])`;
         this.instruction_queue.enqueue({ instruction: sequence, additionalName: `fertilizing` });
 */
    }


    // general function
    async handleGeneralMessage(message: { type: any; data: any; name: string; plant: string }) {

        const { type, data, name, plant } = message;


        const farmbotWrapper = new FarmbotWrapper();

        switch (type) {
            case 'getTool':
                farmbotWrapper.getTool(name, data.x, data.y, data.z, plant);
                break;
            case 'getToolSeeder':
                farmbotWrapper.planting(plant, data.x, data.y, data.z, name);
                break;
            case 'waterAll':
                farmbotWrapper.waterAll(data.x, name);
                break;
            case 'fertilize':
                farmbotWrapper.fertilize(data.x, data.y);
            default:
                console.error('Unrecognized message type:', type);
                break;
        }
    }

    // general function for Lists
    async handleGeneralListMessage(message: { type: any; data: any[]; name: string }) {

        const { type, data, name } = message;


        const farmbotWrapper = new FarmbotWrapper();

        switch (type) {
            case 'waterAll':
                farmbotWrapper.waterAllofList(data, name);
                break;
            case 'hack':
                farmbotWrapper.hackSelected(data,name,type);

                break;
            case 'rotary':
                farmbotWrapper.rotarySelected(data, name);

                break;
            default:
                console.error('Unrecognized message type:', type);
                break;
        }
    }









}

export default FarmbotWrapper;



