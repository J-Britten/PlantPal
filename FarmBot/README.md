# FarmBot README

![FarmBotOutdoor](/Camera/Images/FarmBotOutdoor.png)


__README Author:__ Julian Britten

Here, you will find general information about the FarmBot as well as information about modifications made and specific sequences and routines created that are required for the Custom Web App to work.

For general questions regarding the FarmBot, refer to the offical  [website](https://farm.bot/).
## About
The [FarmBot](https://farm.bot/) is a 100% Open Source gardening robot capable of taking care of most gardening tasks. As part of this project, a `FarmBot Genisis XL` was purchased. In this setup, the bot is able to maintain an area of 6x3m².

## Settings
We modified a few settings, however, we followed the FarmBot installation guide and made sure our settings fit the robot best.


- We disabled auto-firmware updates
- To define gardens for users, we created multiple area-based `plant-groups`


## Modifications
This section covers all modifications made to the FarmBot. This does not include the Camera System, please see [the Camera directory](../Camera/README.MD) for that.

In general, all parts used by the FarmBot exist as 3D CAD models in [OnShape](https://cad.onshape.com), an online CAD editor. If you have an account (Student licenses exist), you can copy their existing workspace into your own and modify their files.
You can find all of the files [here](https://genesis.farm.bot/v1.6/extras/cad)
This may save alot of time in future development.

### Borescope Camera
At some point, the screw-on lid for the Borescope camera was lost. To close off the camera from the bottom, we designed Borescope Camera covers. We opted for the 1cm option in combination with the original Mounts. For better sealing, a small piece of Shrink Tubing is placed around the camera before putting on the mount.

![BoreScope](/Camera/Images/BorescopeCamera.png)

### Water Nozzle
To speed up the watering process, we 3d-printed the [always on Watering Nozzle](https://www.thingiverse.com/thing:4534979) by ClosedCircuit and mounted it to the tool head.

## 3D Printed Parts
- __Borescope Camera Cover 1cm__: A cylinder that works as a replacement for the screw-on lid of the [FarmBot Borescope Camera](https://genesis.farm.bot/v1.6/bom/electronics-and-wiring/camera#)
- __Borescope Camera Cover Full__:  A cylinder that serves as a case for the entire [FarmBot Borescope Camera](https://genesis.farm.bot/v1.6/bom/electronics-and-wiring/camera#), requires the adapted Camera Mount
- __Camera Mount Half - 10.1mm__: Modified Camera Mount Half from FarmBot to fit the Camera with Cover. 

#### Settings
- Printer: `Bambu Lab X1 Carbon`
- Nozzle: `0.4mm`
- Material: `PLA` (Ideally `ASA`)
- Layer Height: `0.2mm`
- Infill: `20%`
- Infill Pattern: `Grid`
- Supports: `Yes`
- Brim: `yes`
- Other: `2 Wall loops`


## API
Our FarmBot Web App requires a farmbot API key to run. Sometimes, this API key resets/becomes invalid and needs to be renewed. We suspect this is when the FarmBot OS updates to a new version
which is why as of now, auto-updates are disabled via the FarmBot Web Interface. 

`api_key.ps1` Powershell script that gets a new API key for FarmBot. Execute in powershell, copy & paste the API key from the output into the `.env` file in the FarmBot WebApp directory to replace the current API key. (Edit the script and fill in your farmbot username & password first)

## Sequences
The FarmBot web interface limits how many lines of code a lua sequence can have (currently 3000). Further, it is only possible to pass 1 variable at once. To work around this, via farmbotJS, it is possible to send entire lua sequences. All the non-standard sequences used can be found directly in the `/server/utils/lua` directory of the WebApp. Aside from that, we have created short  sequences:

### PhotoGridMeta
These values need to be entered into the PhotoGridBuilder if the photo grid is re-calibrated. 
```lua
local grid = photo_grid()
send_message("info", "total " .. grid.total)
send_message("info", "x_grid_points = " .. grid.x_grid_points)
send_message("info", "y_grid_points = " .. grid.y_grid_points)
send_message("info", "x_grid_start_mm = " .. grid.x_grid_start_mm)
send_message("info", "y_grid_start_mm = " .. grid.y_grid_start_mm)
send_message("info", "x_offset_mm = " .. grid.x_offset_mm)
send_message("info", "y_offset_mm = " .. grid.y_offset_mm)
send_message("info", "x_spacing_mm = " .. grid.x_spacing_mm)
send_message("info", "y_spacing_mm = " .. grid.y_spacing_mm)
```

### Overwrite Job Progress
Jobs can cause the robot task queue to get stuck. Completed sequences will disappear automatically, but incomplete jobs won't. However, FarmBot just uses string matching to update jobs. To complete a job, get the job name, and adjust the following sequence accordingly:

```lua
set_job_progress("JOB NAME HERE", {
    percent = 100,
    status = "Complete",
    time = start_time
}) 
```



## Lessons Learned & Useful Information
- FarmBot setup needs to be built _very_ precisely. Otherwise it will get stuck. Take your time when setting up the robot
- At >25°C the rubber belts start to become more elastic causing the bot to stall more often. To avoid this, we introduced a temperature check where the robot will only run if the temperature is within 0-25°C. Of course this only is relevant if the robot is outside.
- At <0°C the FarmBot should not be operated as frozen parts may cause the bot to break. Thus, an indoor space for the winter is required.




