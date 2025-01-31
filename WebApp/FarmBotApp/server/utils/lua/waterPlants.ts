export function waterPlantsSequence(id :number) {

    let sequence = `local watering_time = 2
    local field_id = ${id}
    start_time = os.time() * 1000
    
    local point_group = api({method = "GET", url = "/api/point_groups/"..field_id})
    if not point_group then
        send_message("error", "Failed to fetch point group", "toast")
        return
    end
    
    local point_ids = point_group.point_ids
    local points = {}
    
    for i, point_id in ipairs(point_ids) do
        local point = api({method = "GET", url = "/api/points/"..point_id})
        if point then
            table.insert(points, point)
        end
    end
    local plants = {}
    
    for k, v in pairs(points) do
        if v.pointer_type == "Plant" then
            table.insert(plants, {name = v.name, x = v.x, y = v.y})
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
    
    count = 0
    total = #plants
    job = "Watering all " .. total .. " plants"
    
    send_message(
        "info",
        "Watering all " .. total .. " plants for " .. watering_time .. " seconds each",
        "toast")
    
    for k, v in pairs(plants) do
        coordinates = "(" .. v.x .. ", " .. v.y .. ")"
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

    
    set_job_progress(job, {
        percent = 90,
        status = "Going home..",
        time = start_time
    }) 

    move_absolute(0, 0, 0)

    set_job_progress(job, {
        percent = 95,
        status = "Finding home..",
        time = start_time
    }) 

    find_home("all")

    set_job_progress(job, {
        percent = 100,
        status = "Complete",
        time = start_time
    }) 
  `;
  
    return sequence;
  }
  