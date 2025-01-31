export function moveHome(){
    let sequence = `
    -- Send message with cell info
send_message("info", "Moving Home", "toast")

-- Job
local start_time = os.time() * 1000

set_job_progress("Move Home", {
    status = "Started find home command",
    percent = 0,
    time = start_time
})


--find home command
set_job_progress("Move Home", {
    status = "Z axis homing..",
    percent = 25,
    time = start_time
})
go_to_home("z")
set_job_progress("Move Home", {
    status = "Y axis homing..",
    percent = 50,
    time = start_time
})
go_to_home("y")
set_job_progress("Move Home", {
    status = "X axis homing",
    percent = 75,
    time = start_time
})
go_to_home("x")


set_job_progress("Move Home", {
    status = "Complete",
    percent = 100,
    time = start_time
})`
    return sequence;
}