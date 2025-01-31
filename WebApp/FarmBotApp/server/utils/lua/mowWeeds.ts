

export function mowWeedsSequence(id :number) {

  let sequence = ` rotary_tool_pin = 3 -- 2 for NORMAL DIR
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
  local field_id = ${id}
  local p_group = api({method = "GET", url = "/api/point_groups/"..field_id})
  if not p_group then
  send_message("error", "Failed to fetch point group", "toast")
  return
  end
  local xlower= p_group.criteria.number_gt.x
  local ylower= p_group.criteria.number_gt.y
  local xhigher= p_group.criteria.number_lt.x
  local yhigher= p_group.criteria.number_lt.y
  points = api({
  method = "GET",
  url = "/api/points"})
  for k, v in pairs(points) do
  if v.pointer_type == "Weed" and v.x > xlower and v.x < xhigher and v.y < yhigher and v.y > ylower then
  table.insert(weeds, {x = v.x, y = v.y, z = soil_height(v.x, v.y), radius = v.radius})
  end
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
  attempt_weeding()end
  if env("load") == "stalled" then
  toast("Mowing weed at " .. coords .. " failed after " .. attempts .. " attempt(s); proceeding...", "warn")
  end
  job("Complete", 100)
  end
  pjob("Complete", 100)
  toast("Mowing complete", "success") `

  return sequence;
}