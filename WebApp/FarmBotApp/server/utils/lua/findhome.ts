export function findhome(){
    let sequence = `
        -- Send message with cell info
        send_message("info", "Finding Home", "toast")

        -- Job
        local start_time = os.time() * 1000

        set_job_progress("Find Home", {
            status = "Started find home command",
            percent = 0,
            time = start_time
        })


        --find home command
        set_job_progress("Find Home", {
            status = "Z axis homing..",
            percent = 25,
            time = start_time
        })
        find_home("z")
        set_job_progress("Find Home", {
            status = "Y axis homing..",
            percent = 50,
            time = start_time
        })
        find_home("y")
        set_job_progress("Find Home", {
            status = "X axis homing",
            percent = 75,
            time = start_time
        })
        find_home("x")


        set_job_progress("Find Home", {
            status = "Complete",
            percent = 100,
            time = start_time
        })`
    return sequence;
}