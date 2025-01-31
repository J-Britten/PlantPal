export function rotarySeq(ids :any[]) {
  let plantIdsLuaTable = "{" + ids.join(", ") + "}";
    console.log('ids2',plantIdsLuaTable);
    let sequence =`rotary_tool_pin = 3 
max_load = tonumber(env("rotary_tool_max_load")) or 90
rotary_tool_height = tonumber(env("rotary_tool_height")) or 80
max_attempts = tonumber(env("rotary_tool_max_attempts")) or 3
weeds = {}
count = 0

function job(status, percent)
    set_job_progress("Mowing" .. coords, { status = status, percent = percent, time = job_time })
end
pjob_time = os.time() * 1000
function pjob(status, percent)
set_job_progress("Mowing " .. #weeds .. " weeds", { status = status, percent = percent, time = pjob_time })
end watcher = function(data)
if (data.value > max_load) and (env("load") ~= "stalled") then
env("load", "stalled")
soft_stop()
off(rotary_tool_pin)
toast("Rotary load = " .. data.value .. ")", "warn")
end
end
function attempt_weeding()
attempts = attempts + 1
env("load", "nominal")
job("Moving to weed", 10)
move { x = weed.x - (weed.radius + 50), y = weed.y, z = weed.z + rotary_tool_height + 20, safe_z = true }
on(rotary_tool_pin)
if env("load") == "stalled" then
wait(1500)
return
end job("Descending", 40)
move { z = weed.z + rotary_tool_height, speed = 25 }
if env("load") == "stalled" then
wait(1500)
return
end
job("Mowing", 50)
move { x = weed.x + (weed.radius + 50), speed = 25 }
if env("load") == "stalled" then
wait(1500)
return
end
job("Ascending", 90)
move { z = weed.z + rotary_tool_height + 20, speed = 25 }
if env("load") == "stalled" then
wait(1500)
return
end
off(rotary_tool_pin)
success = true
end
if not verify_tool() then
return
end
local plant_ids = ${plantIdsLuaTable}
for _, plant_id in ipairs(plant_ids) do
local points = api({
method = "GET",
url = "/api/points/"..plant_id
})
if not points then
send_message("error", "Failed to fetch point with ID " .. plant_id, "toast")
return
end
local ground = soil_height(points.x, points.y)
table.insert(weeds, { x = points.x, y = points.y, z = ground+30, radius = points.radius })
end
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
        attempt_weeding()
    end
    if env("load") == "stalled" then
        toast("Mowing weed at " .. coords .. " failed after " .. attempts .. " attempt(s); proceeding...", "warn")
    end
    job("Complete", 100)
end
pjob("Complete", 100)
toast("Mowing complete", "success")

local success, err = pcall(function()
    dismount_tool("Rotary Tool")

end)

if not success then
set_job_progress(job, {
    percent = 100,
    status = "Failed"
})
end

set_job_progress(job, {
    percent = 100,
    status = "Complete"
})
   `;
 
   return sequence;
 }
