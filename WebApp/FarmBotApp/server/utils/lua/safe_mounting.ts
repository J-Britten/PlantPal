export function safe_mounting(tool :any) {

    let sequence =`local function filter_points(points, tool_id)
    local filtered = {}
    for _, point in ipairs(points) do
        if point.tool_id == tool_id then
            table.insert(filtered, point)
        end
    end
    return filtered
end

function failSafeMounting() 
    set_job_progress("Safe Mounting", {
        percent = 100,
        status = "Failed",
        time = start_time
    })
end

local local_points = {}
local safe_MountingJob = "Safe Mounting"
set_job("Safe Mounting")


if verify_tool() then
return
end

mount_tool("${tool}")

if not verify_tool() then
    local tool = get_tool({name = "${tool}"})
    if not tool then
        send_message("error", "Tool not found.")
        return
    end

    local points = api({method = "GET", url = "/api/points"})
    if not points then
        send_message("error", "Failed to fetch points", "toast")
        failSafeMounting() 
        return
    end

    local filtered_points = filter_points(points, tool.id)
    if #filtered_points == 0 then
        send_message("info", "No points found for tool ID: " .. tostring(tool.id))
        failSafeMounting() 
        return
    end

    for _, point in ipairs(filtered_points) do
        send_message("info", "Saving coordinates: x=" .. tostring(point.x) .. " y=" .. tostring(point.y) .. " z=" .. tostring(point.z))
        table.insert(local_points, {x = point.x, y = point.y, z = point.z})
    end

    for _, point in ipairs(local_points) do
        move_absolute(point.x, point.y, point.z)
        move_absolute(point.x, point.y, point.z+50)
        move_absolute(point.x-50, point.y, point.z+50)
        write_pin(8, "digital", 1)
    wait(2000)
    write_pin(8, "digital", 0)
    
        move_absolute(point.x+50, point.y, point.z + 100)
    end

    mount_tool("${tool}")

    if not verify_tool() then
        for _, point in ipairs(local_points) do
            move_absolute(point.x, point.y, point.z)
            move_absolute(point.x, point.y, point.z + 100)
        end
        failSafeMounting() 
        return
    end
end

    set_job_progress("Safe Mounting", {
        percent = 100,
        status = "Complete",
        time = start_time
    }) 


   `;
 
   return sequence;
 }
