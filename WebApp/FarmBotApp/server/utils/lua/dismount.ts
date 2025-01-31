export function dismount(tool: any) {

  // This function is used to dismount a tool from the FarmBot
  // the LUA dismount_tool() function has error handling and job progress tracking on its own, so we can set the job to 100% and complete and even if dismount fails it will show "Failed" in the logs
    let sequence = `
        
    dismount_tool("${tool}")



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
