export function waterSelectedSeq(ids :any[]) {
  console.log('ids',ids);
  let plantIdsLuaTable = "{" + ids.join(", ") + "}";
  console.log('ids2',plantIdsLuaTable);
  let sequence =`mount_tool("Watering Nozzle")
local watering_time = 5
local plant_ids = ${plantIdsLuaTable}
start_time = os.time() * 1000

local function fetch_plant_points(plant_id)
  local points = api({method = "GET", url = "/api/points/"..plant_id})
  if not points then
      send_message("error", "Failed to fetch point for plant ID "..plant_id, "toast")
      return nil
  end
  return points
end

local plants = {}

for _, plant_id in ipairs(plant_ids) do
  local points = fetch_plant_points(plant_id)
  if points and points.pointer_type == "Plant" then
      table.insert(plants, {name = points.name, x = points.x, y = points.y})
  end
end

table.sort(plants, function(l, r)
  -- "close enough" approximation.
  if math.abs(l.x - r.x) < 150 then
      return l.y < r.y
  else
      return l.x < r.x
  end
end)

local count = 0
local total = #plants
local job = "Watering all " .. total .. " plants"

send_message(
  "info",
  "Watering all " .. total .. " plants for " .. watering_time .. " seconds each",
  "toast")

for _, v in ipairs(plants) do
  local coordinates = "(" .. v.x .. ", " .. v.y .. ")"
  set_job_progress(job, {
      percent = 100 * (count) / total,
      status = "Moving to " .. (v.name or "plant") .. " at " .. coordinates,
      time = start_time
  })
  move_absolute(v.x - 60, v.y, 0)
  set_job_progress(job, {
      percent = 100 * (count + 0.5) / total,
      status = "Watering " .. (v.name or "plant") .. " for " .. watering_time .. " seconds",
      time = start_time
  })
  write_pin(8, "digital", 1)
  wait(watering_time * 1000)
  write_pin(8, "digital", 0)
  count = count + 1
end

-- local success, err = pcall(function()
--  dismount_tool("Watering Nozzle")

-- end)

if not success then
set_job_progress(job, {
  percent = 100,
  status = "Failed"
  time = start_time
})
end

set_job_progress(job, {
  percent = 100,
  status = "Complete"
  time = start_time
})
 `;

 return sequence;
}
