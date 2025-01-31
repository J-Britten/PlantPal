# Camera Infrastructure
![Title](./Images/CameraTitle.png) 


__README Author:__ Julian Britten

FarmBot by default only supports one camera - the one mounted to it's arm pointing down.
To be able to use additional webcams, we built a Client - Server infrastructure using a [MediaMTX](https://github.com/bluenviron/mediamtx) server streaming to it with multiple Raspberry Pi's using [libcamera-vid](https://www.raspberrypi.com/documentation/computers/camera_software.html) and [FFmpeg](https://www.ffmpeg.org/).

We provide 3 additional camera angles: a birdseye view, a center top-down view as well as a side view. 

## Hardware
For our camera infrastructure, we installed multiple Raspberry Pis and Raspberry Pi Cameras. We utilize the spare peripheral pins of the `FarmBot` for on-board power supply. We designed custom rainproof cases for our cameras which can be found in the `3d Printed Parts` directory. For a detailed list of electronics and parts used along with
assembly instructions, please refer to the [Hardware README File](./Hardware.md) 


## Server

The server is runs a [MediaMTX](https://github.com/bluenviron/mediamtx) media proxy. Camera clients can publish an `RTSP` stream which can be read by receiving clients.


## Client
### Publishing / Broadcasting
To publish a webcam stream to the server using RTSP, using [FFmpeg]([FFmpeg](https://www.ffmpeg.org/)) is required.
Of course, all devices also require an active internet connection!

#### Windows

Unzip the folder at a location and add that path (e.g. `C:\ffmpeg\bin`) to your PATH environment variables.

On __Windows__, you need to get the name of your webcam first. Run this command
```
ffmpeg -list_devices true -f dshow -i dummy
```
Then, to broadcast to the server, run
```
ffmpeg -f dshow -rtbufsize 1G -i video="<WEBCAM NAME>" -pix_fmt yuv420p -c:v libx264 -tune zerolatency -preset fast -b:v 600k -f rtsp rtsp://USER:PASSWORD@SERVERIP:PORT/<CUSTOM>
```

#### Raspberry PI
Ensure `ffmpeg` and `libcamera-vid` are installed.


To broadcast to the server, we used the following command. __Note__: It may need adjustments to fit your specific needs. 

```
libcamera-vid --nopreview -t 0 --inline --framerate 24 -o - | ffmpeg -probesize 32 -analyzeduration 0 -i - -c:v libx264 -preset ultrafast -tune zerolatency -b:v 600k -maxrate 600k -bufsize 1200k -rtbufsize 200M -fflags discardcorrupt -vf "transpose=2" -f rtsp -timeout 10000000 -rw_timeout 10000000 rtsp://USER:PASSWORD@SERVERIP:PORT/<CUSTOM>
```

The easiest way to run this script on boot, is to use a separate bash script along with a cronjob:

1. Create a new bash file: `sudo nano /path/to/file/camera_stream.sh`
2. Insert the command above into the bash script. The file needs to begin like this
```
#!/bin/bash

<add code here>
```
3. Run `chmod +x /path/to/file/camera_stream.sh` to make the script executable
4. Add the script to a cronjob: Run `crontab -e`
5. At the bottom, add
```
@reboot home/<user>/path/to/file/camera_stream.sh
```

An example file used by our Camera Infrastructure can be found in the `Client` Directory


#### Additional Notes

The ffmpeg command needs to be adapted to your hardware and may not run out of the box.

The `<Custom>` tag can be anything you want. Make sure it is unique in order to be able to distinguish between cameras.

It appears that the `-c:v libx264` parameter is __required__ for making the stream available via `WebRTC` (in your browser).

### Subscribing / Watching
#### Browser
You can watch a stream via `WebRTC` in any browser by entering this address 
```
http(s)://SERVERIP:8889/<CUSTOM>
```
Enter the username `USER` and password `PASSWORD` into the login prompt if they are set in the `mediamtx.yaml` config file.

#### RTSP
To watch an RTSP stream (without a custom solution), consider using a program like `VLC Media Player` or `OBS Studio`.
For VLC, click `Media > Open Network Stream` and enter the following
address
```
rtsp://SERVERIP:8554/<Custom>
```

Note that `<Custom>` needs to match one of the published streams from before.


# Available Streams
During our study, the following streams were available:

- `pi4_1`: Shows the `FarmBot` from a birdseye perspective
- `pi4_2`: Shows the `FarmBot` from a side-view perspective
- `pi4_3`: Shows the `FarmBot` from a top-down center perspective

# References
- Real-Time Media Server `MediaMTX`: [https://github.com/bluenviron/mediamtx](https://github.com/bluenviron/mediamtx)
- Open-Source Library for Media Streaming `ffmpeg`: [https://www.ffmpeg.org/](https://www.ffmpeg.org/)