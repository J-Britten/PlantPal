



export function hackSeq(ids: any[]) {

  let plantIdsLuaTable = "{" + ids.join(", ") + "}";


  let sequence = `--mount_tool("Weeder")

--if not verify_tool() then
  --  return
--end

local plant_ids = ${plantIdsLuaTable}

--local ground = 470

local function fetch_plant_points(plant_id)
    local points = api({method = "GET", url = "/api/points/" .. plant_id})
    if not points then
        send_message("error", "Failed to fetch point for plant ID " .. plant_id, "toast")
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
    if math.abs(l.x - r.x) < 150 then
        return l.y < r.y
    else
        return l.x < r.x
    end
end)

local count = 0
local total = #plants
local job = "Weeding all " .. total .. " plants"

send_message("info", job, "toast")

for _, v in ipairs(plants) do
    local coordinates = "(" .. v.x .. ", " .. v.y .. ")"
    set_job_progress(job, {
        percent = 100 * count / total,
        status = "Moving to " .. (v.name or "plant") .. " at " .. coordinates
    })
    move_absolute(v.x, v.y, 0)
    set_job_progress(job, {
        percent = 100 * (count + 0.5) / total,
        status = "Weeding " .. (v.name or "plant")
    })
    local ground = soil_height(v.x,v.y);
    -- Weeding movements
    move_absolute(v.x, v.y, ground +40)
    move_absolute(v.x, v.y, ground + 80)
    move_absolute(v.x, v.y + 2, ground + 40)
    move_absolute(v.x, v.y+2, ground + 80)
    move_absolute(v.x + 2, v.y, ground +40)
    move_absolute(v.x +2, v.y, ground + 400)
    
    count = count + 1
end
local success, err = pcall(function()
    dismount_tool("Weeder")
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
})`


  return sequence;
}