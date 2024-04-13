![Banner](./img/banner.png)

VideoSqueeze is a CLI tool that compresses your videos


![demo](./img/demo.gif)


VideoSqueeze CLI is a simple JavaScript project that compresses a given video by its path. It uses [ffmpeg](https://github.com/FFmpeg/FFmpeg) under the hood. It's able to compress a single video, or a directory with multiple videos at once. Key features include:
- Compress a single video quickly
- Compress a bunch of videos with a few clicks
- Resume from where you stopped compressing
- Customizable compression profiles and presets
- CPU limiter for controlling resource usage
- Configuration file for easy customization


## Installation
To install VideoSqueezer CLI, you have two options:

### Option 1: Windows Release
1. Download the [Windows release](https://www.google.com).
2. Extract the downloaded archive.
3. Open the extracted folder and locate the `VideoSqueezeCLI.exe` file.
4. Double-click on `VideoSqueezeCLI.exe` to launch the CLI tool.

### Option 2: Cloning the Project
(*Note: Option 2 requires Node.js to be installed on your machine. Make sure you have Node.js installed*)
1. Clone this project to your local machine.
2. Open a terminal and navigate to the project directory.
3. Install the required dependencies by running the following command:

```sh
npm install
```

4. Run VideoSqueezer CLI by executing the following command:

```sh
npm start
```

These commands will install the necessary dependencies and start VideoSqueezer CLI.


## Usage

VideoSqueeze is a user-friendly CLI tool that is easy to use and navigate. Here's a quick guide:

By running the program, you will be asked to choose either you want to compress a single video, or compress a bunch of videos in a given directory.


```
┏╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍┑
╎ ____      ___     _            _____                                  ╎
╎ \ \ \    / (_)   ╎ ╎          / ____╎                                 ╎
╎  \ \ \  / / _  __╎ ╎ ___  ___╎ (___   __ _ _   _  ___  ___ _______    ╎
╎   \ \ \/ / ╎ ╎/ _` ╎/ _ \/ _ \\___ \ / _` ╎ ╎ ╎ ╎/ _ \/ _ \_  / _ \   ╎
╎    \ \  /  ╎ ╎ (_╎ ╎  __/ (_) ╎___) ╎ (_╎ ╎ ╎_╎ ╎  __/  __// /  __/   ╎
╎     \_\/   ╎_╎\__,_╎\___╎\___/_____/ \__, ╎\__,_╎\___╎\___/___\___╎   ╎
╎                                         ╎ ╎                           ╎
╎                                         ╎_╎                           ╎
╎                                                                       ╎
╎ Simple CLI video compression tool.                                    ╎
┗╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍┛


Welcome to VideoSqueeze! Please select your option

[1]: Compress a single video
[2]: Compress a directory of videos
[9]: Exit the program
```


### Compress a single video
To compress a single video, type `1` and press enter.
After that, you will be asked to paste the path for your video to be compressed.
[Click here](#how-to-copy-a-videos-path-quickly-for-windows-users) for a tip on how to copy and paste the path of a video quickly in Windows

```
Please enter the path + file Name. For example:
    C:\Videos\video.mp4
or
    /home/yourname/Videos/video.mp4
```


After pasting the video path, you will receive information about the video, followed by a list of compression profiles to choose from
```
Got the video! Here's some information about your video:
Name: Random video.mp4
Size: 123.73MB
Duration: 00:01:00
location: D:\Videos\MySpecialFolder\Random video.mp4
Date Created: Fri Mar 29 2024
Resolution: 3440x1440
Frame rate 60/1
Bit rate 16517 kbps


Please choose your compression profile
    General-purposes options:
        [1]: High Quality (-crf 18)
        [2]: Balanced (-crf 23)
        [3]: Small Size (-crf 28)

    More-specefic senarios
        [4]: Animation (good for cartoons/animes)
        [5]: Still images (good for slideshow-like content)
        [6]: Custom crf value...
```

Choose your compression profile by typing the number associated with it and press enter. [Click here](#what-compression-profile-should-i-choose) to get help on what compression profile should you choose

After choosing a compression profile, you're done! wait for the video to finish compressing and check it out in `./compressed-videos` folder.
```

Currently compressing video1.mp4
    Compressing: ◼◼◼◼◼◼◼◼◼◼ 100%


The video has been compressed!
    It's located in C:\Users\yourname\Documents\VideoSqueezeCLI\compressed_videos\Random video-compressed.mp4


Video's size before compression: 123.73MB
Video's size After compression: 73.48MB

    You saved 50.26MB!


Press Enter to continue..
```

The program will inform you whether you have saved space or not, and it will also provide the amount of space saved.


### Compress a directory of videos
To compress multiple videos in a specific folder or directory at once, type `2` in the main and press enter.
After that, you will be asked to paste the path of the folder or directory containing the videos you want to compress.

```

Please enter the Path for the directory to compress. For example:
    C:\Videos\To Be Compressed Folder\
or
    /home/yourname/Videos/ToBeCompressedFolder/

```

Paste the path and press enter.
After you provide the path, the program will add all the videos in this directory to the compression queue. Then followed by a list of compression profiles to choose from

```
D:\Videos\YourFolderName
Added (video1.mp4) to the list
Added (video2.mp4) to the list
Added (video3.mp4) to the list
...
Added (video10.mp4) to the list


Found 10 videos to compress in YourFolderName


Please choose your profile
    General-purposes options:
        [1]: High Quality (-crf 18)
        [2]: Balanced (-crf 23)
        [3]: Small Size (-crf 28)

    More-specefic senarios
        [4]: Animation (good for cartoons/animes)
        [5]: Still images (good for slideshow-like content)
        [6]: Custom crf value...
```

Choose your compression profile by typing the number associated with it and press enter. [Click here](#what-compression-profile-should-i-choose) to get help on what compression profile should you choose

After choosing a compression profile, you're done! Wait for the videos to finish compressing and check them out in `./compressed-videos/YourFolderName-compressed` .

```
...
Video 8 out of 10
Compressing: ◼◼◼◼◼◼◼◼◼◼ 99%


The video number 8 has been compressed!
    It's located in C:\Users\yourname\Documents\VideoSqueezeCLI\compressed_videos\YourFolderName-compressed\video8-compressed.mp4

Video 9 out of 10
Compressing: ◼◼◼◼◼◼◼◼◼◼ 99%


The video number 9 has been compressed!
    It's located in C:\Users\yourname\Documents\VideoSqueezeCLI\compressed_videos\YourFolderName-compressed\video9-compressed.mp4

Video 10 out of 10
Compressing: ◼◼◼◼◼◼◼◼◼◼ 99%


The video number 10 has been compressed!
    It's located in C:\Users\yourname\Documents\VideoSqueezeCLI\compressed_videos\YourFolderName-compressed\video10-compressed.mp4


directory's Size before compression: 24.36MB
directory's Size After compression: 5.57MB


    You saved 18.79MB!


Press Enter to continue..


```


## Configuration and Customization
You will find `./config.json` file that contains the possible configuration and customization for the program. Here's a brief explanation for each option and possible values:
```json
{
  "PathToFfmpegForExe": "./ffmpeg/bin/ffmpeg.exe",
  "PathToFfprobeForExe": "./ffmpeg/bin/ffprobe.exe",
  "compressionPath": "./compressed_videos",
  "numberOfThreads": 0,
  "ffmpegCodec": "libx264",
  "compressAudioToo": false,
  "compressionPreset": "faster"
}
```


- **`"PathToFfmpegForExe"` and `"PathToFfprobeForExe"` (For Windows release only):**

These are the paths for your `ffmpeg.exe` and `ffprobe.exe`. **These are only relevant for the windows release**. The default behavior for the program to assume that they are located in the same folder where the program is running. The windows release is bundled with the necessary ffmpeg and ffprobe to be able to run the program. However, you may alter the values to you ffmpeg and ffprobe paths and delete the bundled ffmpeg to save space.
If you're running the program via NodeJS, the npm libraries `"@ffmpeg-installer/ffmpeg"` and `"@ffprobe-installer/ffprobe"` will automatically install the appropriate ffmpegs for your system, whether was it Windows or Linux/Unix.  

- **`"compressionPath"`:**

This is the path where your compressed videos will be saved. By default, the program will store them in a folder named `./compressed-videos` in wherever the program is running from. You may alter the value to your second drive for better space and disk management. 

- **`"numberOfThreads"`:**

This is the number of threads used for video compression. By default, the value is set to `0`, which means that all available threads will be utilized. You may alter the value to a specified number of threads for better resource management.  

- **`"ffmpegCodec"`:**

This is the codec used to compress your videos. The default value is `"libx264"` which is widely-used H.264 video codec. It's excellent balance between video quality and file size. Possible codecs are:
**`"libx265"`**: This codec is based on the HEVC. Offers improved compression efficiency compared to libx264 But it may not be as widely supported as libx264 on older or less capable devices

- **`"compressAudioToo"`:**

This is a toggle for compressing the audio stream of the video. By default it's set to `false` which means that the audio will be copied as-is to the compressed video without any compression applied. You may set it to `true` to compress the audio too for smaller file size

- **`"compressionPreset"`:**

This is the preset for you video compression. A preset is a trade-off between encoding speed and compression ratio. By default it's set to `faster`. Which provide a quick compression time and reasonably reduced file size. Possible presets are:
`"ultrafast"` `"veryfast"` `"faster"` `"fast"` `"medium"` `"slow"` `"slower"` `"veryslow"` `"placebo"`




## FAQ

### What compression profile should I choose?
It depends on your specific needs and preferences. Here's a brief description:
* **High Quality (-crf 18):** Prioritizes video quality while still applying compression.
* **Balanced (-crf 23):** Achieves a balance between compression level and video quality.
* **Small Size (-crf 28):** Prioritizes smaller file sizes while sacrificing some video quality.

The other profiles are self-descriptive and optimized for specific scenarios.

### How to copy a video's path quickly? (for Windows users)
1. Locate the video file you want to copy the path of.
2. Press the Shift key and right-click on the video file.
3. From the context menu that appears, select "Copy as path".
4. In the terminal window, click left-click to paste the path into the terminal.

![alt text](./img/context-menu.png)

.