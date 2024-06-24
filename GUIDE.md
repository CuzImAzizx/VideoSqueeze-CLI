# Quick Guide For VideoSqueeze 

By running the program, you will be asked the following options:

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
[3]: View compression history
[9]: Exit the program
```


## Compress a single video
To compress a single video, type `1` and press enter.
After that, you will be asked to paste the path for your video to be compressed.
[Click here](README.md#how-to-copy-a-videos-path-quickly-for-windows-users) for a tip on how to copy and paste the path of a video quickly in Windows

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

Choose your compression profile by typing the number associated with it and press enter. [Click here](README.md#what-compression-profile-should-i-choose) to get help on what compression profile should you choose

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


## Compress a directory of videos
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

Choose your compression profile by typing the number associated with it and press enter. [Click here](README.md#what-compression-profile-should-i-choose) to get help on what compression profile should you choose

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

## View compression history
To view the total videos that has been compressed using VideoSqueeze-CLI and the total saved space, type `3` in the main menu and press enter.
After that, VideoSqueeze-CLI will print the total videos that has been compressed and the total saved space as following:
```

You have used VideoSqueeze-CLI to compress 69 videos.
You have saved total of 420.0MB in space!
You can see all the videos in ./compression_log.json


Press any button to continue..

```