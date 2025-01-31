export function plantingSequence(plantBinPosition: any) {
  let sequence = `
  local tray = {
   pointer_type = "ToolSlot",
   pullout_direction = 1,
   x = 50,
   y = 447,
   z = -400,
}


local lokation = {
   x = ${plantBinPosition.x},
   y = ${plantBinPosition.y},
   z = 0
}

vacuum_pump_pin = 9


-- Send message with cell info
send_message("info", "Seeding", "toast")

-- Job
set_job("Seeding")

local start_time = os.time() * 1000
function job(status, percent)
   set_job_progress("Seeding", {
       status = status,
       percent = percent,
       time = start_time
   })
end

-- Safe Z move to above the cell
job("Moving to Seed Tray", 10)
local move_params1 = {
   x = tray.x,
   y = tray.y,
   z = tray.z + 150,
   safe_z = true
}
move_absolute(move_params1)


-- Pick up seed
job("Picking up seed", 20)
write_pin(vacuum_pump_pin, "digital", 1)
local move_params2 = {
   x = tray.x,
   y = tray.y,
   z = tray.z + 65
}
move_absolute(move_params2)


-- Retract Z
job("Retracting Z", 30)
local move_params3 = {
   x = tray.x,
   y = tray.y,
   z = 0
}
move_absolute(move_params3)

job("Complete", 40)

--lokation = variable("Location 1")
local offset_ground = 450
local retract_needle = 200
job("Planting", 50)
local ground = soil_height(lokation.x, lokation.y)
local move_params4 = {
   x = lokation.x,
   y = lokation.y,
   z = lokation.z
}
move_absolute(move_params4)


local move_params5 = {
   x = lokation.x,
   y = lokation.y,
   z = ground + 100
}
move_absolute(move_params5)
job("Complete", 60)



write_pin(vacuum_pump_pin, "digital", 0)
local move_params6 = {
   x = lokation.x,
   y = lokation.y,
   z = 0
}
move_absolute(move_params6)


-- Send message with cell info
job("Complete", 70)

go_to_home()
job("Complete", 80)


find_home("all")

job("Complete", 100)
    
`;

  return sequence;
}
