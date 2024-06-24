/*
This is where the magic happen. Both "main.js" and "main-win.js" will run this code
*/
const ffmpeg = require('fluent-ffmpeg')
const prompt = require("prompt-sync")({ sigint: true })
const fs = require('fs')
const sf = require('seconds-formater');
const bytes = require('bytes')
const logUpdate = require('log-update')
const path = require('path');


const videoFormats = [`mp4`, `mov`, `avi`, `flv`, `mkv`]

// Read the configuration from config.json file
function readConfig() {
    try {
      const configData = fs.readFileSync('./config.json');
      const config = JSON.parse(configData);
      return config;
    } catch (error) {
      console.error('Error reading config.json:', error);
      return {};
    }
}


/*
This function will ask the uset to enter the path and name of the video that -
want to be compressed. It will be validated before returning the path.
*/
function getPathAndNameFromUser() {
    console.log(`
Please enter the path + file Name. For example:
    C:\\Videos\\video.mp4
or
    /home/yourname/Videos/video.mp4
    `)
    let videoPathAndName = prompt().trim().replace(/"/g, '')
    if(videoPathAndName == ""){
        console.log(`
Please provide a file path..
        `)
        return false
    }
    if (!fs.existsSync(videoPathAndName)) {
        console.log(`
${path.basename(videoPathAndName)} does not exist in ${path.resolve(videoPathAndName)}
        `)
        return false
    }
    let pathStat = fs.statSync(videoPathAndName);
    if(pathStat.isDirectory()){
        console.log(`
${path.basename(videoPathAndName)} is a directory, not a video.
        `)
        return false
    }

    return videoPathAndName

}
/*
This function will ask the uset to enter the path that contains the videos that -
need to be compressed. It will be validated before returning the path.
*/
function getPathFromUser() {
    console.log(`
Please enter the Path for the directory to compress. For example:
    C:\\Videos\\To Be Compressed Folder\\
or
    /home/yourname/Videos/ToBeCompressedFolder/
    `)
    let PathToCompress = prompt().trim().replace(/"/g, '')
    if(PathToCompress == ""){
        console.log(`
Please provide a file path..
        `)
        return false
    }
    if (!fs.existsSync(PathToCompress)) {
        console.log(`
${path.basename(PathToCompress)} does not exist in ${path.resolve(PathToCompress)}
        `)
        return false
    }
    let pathStat = fs.statSync(PathToCompress);
    if(!pathStat.isDirectory()){
        console.log(`
${path.basename(PathToCompress)} is not a directory.
        `)
        return false
    }
    return path.resolve(PathToCompress)
}

//This is a simple check of the file name ends with a video extention (.mp4, .mov, etc)
function isVideo(videoName) {
    
    for (let i = 0; i < videoFormats.length; i++) {
        if (videoName.toLowerCase().endsWith(videoFormats[i])) {
            return true
        }
    }
    return false
}

//This will check if the video or directory has been compressed before.
function isCompressed(outputName) {
    const config = readConfig()
    if (fs.existsSync(`${config.compressionPath}/${outputName}`)) {
        return true
    }
    return false
}

/*
This will ask the user if he wants to overwrite the compressed video.
*/
async function isUserWantOverwrite(outputName) {
    const config = readConfig()
    const stats = fs.statSync(`${config.compressionPath}/${outputName}`)
    let theThing
    if(stats.isDirectory()){
        theThing = `directory`
    } else {
        theThing = `video`
    }

    console.log(`
This ${theThing} is already has been compressed.
    It's located in ${path.resolve(`${config.compressionPath}/${outputName}`)}

Do you want to overwrite the existing ${theThing} ${outputName}? (y/n)
    `)
    let overwriteChoice = ''
    while (overwriteChoice != 'y') {
        overwriteChoice = prompt().trim().toLowerCase()
        if (overwriteChoice == 'n') {
            console.log(`
Will not overwrite ${outputName}
            `)
            return false
        } else if (overwriteChoice == 'y') {
            return true
        } else {
            console.log(`
invalid option.

Do you want to overwrite the existing ${theThing} ${outputName}? (y/n)
            `)
        }
    }
}

//This will return an object contains the video details
async function getVideoinfo(videoPathAndName) {
    videoPathAndName = path.resolve(videoPathAndName);
    try {
        const stats = fs.statSync(videoPathAndName)
        let obj = {}
        try {
            await new Promise((resolve, reject) => {
                ffmpeg.ffprobe(videoPathAndName, (err, data) => {
                    if (err) {
                        let errorMessage = `${err}`;
                        console.log(`
An error occurred while processing ${path.basename(videoPathAndName)}.
This may be due to ${path.basename(videoPathAndName)} being a corrupted video.
                        `)
                        reject(false)
                        return false
                    }
                    let videoStream = data.streams.find((stream) => stream.codec_type === 'video');
                    obj.name = path.basename(videoPathAndName)
                    obj.path = path.resolve(videoPathAndName)
                    obj.size = stats.size
                    obj.duration = videoStream.duration
                    obj.dateCreated = stats.birthtime.toDateString()
                    obj.resolution = `${videoStream.width}x${videoStream.height}`
                    obj.frameRate = videoStream.r_frame_rate
                    obj.bitRate = videoStream.bit_rate
                    resolve(true)
                })
    
    
            }) 
        } catch {
            return false
        }
        return obj
    } catch (err) {
            console.log(`
Sorry, an Error occurred while reading the file properties:
            ${err}
          `);    
        return false
    }
}

async function printDuration(duration){
    if(isNaN(duration)){
        return duration
    } else {
        return sf.convert(duration).format()
    }
}

//This function will return a message that contains the loading bar using the progress.
function buildLoadingMessage(progress) {
    let loadingBar = '';
    const progOutOfTen = Math.round(progress.percent / 10);
    for (let i = 1; i <= progOutOfTen; i++) {
        loadingBar = loadingBar + "◼";
    }
    if (progOutOfTen < 10) {
        const leftSquare = 10 - progOutOfTen;
        for (let i = 1; i <= leftSquare; i++) {
            loadingBar = loadingBar + "◻";
        }
    }
    const loadingMessage = `Compressing: ${loadingBar} ${Math.round(progress.percent)}%`
    return loadingMessage;

}

//This will print the size difference
function printSizeDiff(sizeBefore, sizeAfter, isDir){
    let savedSpace = sizeBefore - sizeAfter
    if(isDir){
        theThing = `Directory`
    } else {
        theThing = `Video`
    }
    console.log(`
${theThing}'s size before compression: ${bytes(sizeBefore)}
${theThing}'s size after compression: ${bytes(sizeAfter)}
    `)

    if(savedSpace > 0){
        console.log(`
    You saved ${bytes(savedSpace)}!
        `)
    } else {
        savedSpace = Math.abs(savedSpace)
        console.log(`
Your compressed ${theThing} is larger than the original by ${bytes(savedSpace)}.
You might want to try a different compressing profile.
        `)
    }
    return
}

//This will put the data in compression_log.json file.
async function logInfo(oldVideo, newVideo, compressionProfile){
    const config = readConfig()
    let logData = JSON.parse(fs.readFileSync(config.compressionHistory))
    logData.push({
        oldVideo: {
            name: oldVideo.name,
            path: oldVideo.path,
            size: oldVideo.size
        },
        newVideo: {
            name: newVideo.name,
            path: newVideo.path,
            size: newVideo.size,
            compressionProfile: compressionProfile
        }
    })
    logData = JSON.stringify(logData, null, 2);
    fs.writeFileSync(config.compressionHistory, logData);
    console.log(`The data has been logged in ${config.compressionHistory}`)
}

//This is option 1: compress a single video
async function compressVideo() {

    const config = readConfig()
    if(!config) return
    let videoPathAndName = getPathAndNameFromUser()
    if (!videoPathAndName) {
        return
    }

    if (!isVideo(videoPathAndName)) {
        console.log(`
Error: ${path.basename(videoPathAndName)} is not a video. returning..
        `)
        return
    }

    let videoName = path.basename(videoPathAndName) // video.mp4
    let outputName = `${videoName.slice(0, -4)}-compressed.mp4` // video-compressed.mp4

    if (isCompressed(outputName)) {
        if (!await isUserWantOverwrite(outputName)) {
            return
        }
    }

    const toBeCompressedVideoDetails = await getVideoinfo(videoPathAndName)
    if(!toBeCompressedVideoDetails){
        //This will happen if the video is correpted
        return
    }
    console.log(`
Got the video! Here's some information about your video:
Name: ${toBeCompressedVideoDetails.name}
Size: ${bytes(toBeCompressedVideoDetails.size)}
Duration: ${ await printDuration(toBeCompressedVideoDetails.duration) }
location: ${path.resolve(videoPathAndName)}
Date Created: ${toBeCompressedVideoDetails.dateCreated}
Resolution: ${toBeCompressedVideoDetails.resolution}
Frame rate ${toBeCompressedVideoDetails.frameRate}
Bit rate ${Math.round(toBeCompressedVideoDetails.bitRate / 1024)} kbps
    `)
    console.log(`
Please choose your profile
    General-purposes options:
        [1]: High Quality (-crf 18)
        [2]: Balanced (-crf 23)
        [3]: Small Size (-crf 28)

    More-specefic senarios
        [4]: Animation (good for cartoons/animes)
        [5]: Still images (good for slideshow-like content)
        [6]: Custom crf value...
    `)
    let profileChoice = prompt().trim()
    
    /*
    I am not proud of the following code.
    But I spent a whole day trying to make it clean and avoid code duplication.
    This works and can arguably be efficient and readable.
    */

    if (profileChoice == 1) {
        await new Promise((resolve, reject) => {
            let command = ffmpeg(`${videoPathAndName}`);
            command.output(`${config.compressionPath}/${outputName}`)
            command.addOption(`-map 0`);
            command.videoCodec(`${config.ffmpegCodec}`);
            command.addOption(`-preset ${config.compressionPreset}`)
            command.addOption(`-threads ${config.numberOfThreads}`)
            if(!config.compressAudioToo){
                command.addOption(`-c:a copy`)
            }

            /*
            This is what get change for each profile.
            */
            command.addOption(`-crf 18`) // Profile 1

            command.on('error', (error) => {
                console.log(`
an error occured while compressing ${videoName}
    Error message: ${error}
                `)
                reject();
            });
            command.on('progress', (progress) => {
                logUpdate(`
Currently compressing ${videoName}
${buildLoadingMessage(progress)}
                `);
            })                                    
            command.on('end', () => {
                console.log(`
The video has been compressed!
    It's located in ${path.resolve(`${config.compressionPath}/${outputName}`)} 
              `);  
                resolve();
            })
            command.run();
        });    

    } else if(profileChoice == 2){
        await new Promise((resolve, reject) => {
            let command = ffmpeg(`${videoPathAndName}`);
            command.output(`${config.compressionPath}/${outputName}`)
            command.addOption(`-map 0`);
            command.videoCodec(`${config.ffmpegCodec}`);
            command.addOption(`-preset ${config.compressionPreset}`)
            command.addOption(`-threads ${config.numberOfThreads}`)
            if(!config.compressAudioToo){
                command.addOption(`-c:a copy`)
            }

            /*
            This is what get change for each profile.
            */
            command.addOption(`-crf 23`) // Profile 2

            command.on('error', (error) => {
                console.log(`
an error occured while compressing ${videoName}
    Error message: ${error}
                `)
                reject();
            });
            command.on('progress', (progress) => {
                logUpdate(`
Currently compressing ${videoName}
${buildLoadingMessage(progress)}
                `);
            })                                    
            command.on('end', () => {
                console.log(`
The video has been compressed!
    It's located in ${path.resolve(`${config.compressionPath}/${outputName}`)} 
              `);  
                resolve();
            })
            command.run();
        });    

    } else if(profileChoice == 3){
        await new Promise((resolve, reject) => {
            let command = ffmpeg(`${videoPathAndName}`);
            command.output(`${config.compressionPath}/${outputName}`)
            command.addOption(`-map 0`);
            command.videoCodec(`${config.ffmpegCodec}`);
            command.addOption(`-preset ${config.compressionPreset}`)
            command.addOption(`-threads ${config.numberOfThreads}`)
            if(!config.compressAudioToo){
                command.addOption(`-c:a copy`)
            }

            /*
            This is what get change for each profile.
            */
            command.addOption(`-crf 28`) // Profile 3

            command.on('error', (error) => {
                console.log(`
an error occured while compressing ${videoName}
    Error message: ${error}
                `)
                reject();
            });
            command.on('progress', (progress) => {
                logUpdate(`
Currently compressing ${videoName}
${buildLoadingMessage(progress)}
                `);
            })                                    
            command.on('end', () => {
                console.log(`
The video has been compressed!
    It's located in ${path.resolve(`${config.compressionPath}/${outputName}`)} 
              `);  
                resolve();
            })
            command.run();
        });    

    } else if(profileChoice == 4){
        await new Promise((resolve, reject) => {
            let command = ffmpeg(`${videoPathAndName}`);
            command.output(`${config.compressionPath}/${outputName}`)
            command.addOption(`-map 0`);
            command.videoCodec(`${config.ffmpegCodec}`);
            command.addOption(`-preset ${config.compressionPreset}`)
            command.addOption(`-threads ${config.numberOfThreads}`)
            if(!config.compressAudioToo){
                command.addOption(`-c:a copy`)
            }

            /*
            This is what get change for each profile.
            */
            command.addOption(`-tune animation`) // Profile 4

            command.on('error', (error) => {
                console.log(`
an error occured while compressing ${videoName}
    Error message: ${error}
                `)
                reject();
            });
            command.on('progress', (progress) => {
                logUpdate(`
Currently compressing ${videoName}
${buildLoadingMessage(progress)}
                `);
            })                                    
            command.on('end', () => {
                console.log(`
The video has been compressed!
    It's located in ${path.resolve(`${config.compressionPath}/${outputName}`)} 
              `);  
                resolve();
            })
            command.run();
        });    

    } else if(profileChoice == 5){
        await new Promise((resolve, reject) => {
            let command = ffmpeg(`${videoPathAndName}`);
            command.output(`${config.compressionPath}/${outputName}`)
            command.addOption(`-map 0`);
            command.videoCodec(`${config.ffmpegCodec}`);
            command.addOption(`-preset ${config.compressionPreset}`)
            command.addOption(`-threads ${config.numberOfThreads}`)
            if(!config.compressAudioToo){
                command.addOption(`-c:a copy`)
            }

            /*
            This is what get change for each profile.
            */
            command.addOption(`-tune stillimage`) // Profile 5

            command.on('error', (error) => {
                console.log(`
an error occured while compressing ${videoName}
    Error message: ${error}
                `)
                reject();
            });
            command.on('progress', (progress) => {
                logUpdate(`
Currently compressing ${videoName}
${buildLoadingMessage(progress)}
                `);
            })                                    
            command.on('end', () => {
                console.log(`
The video has been compressed!
    It's located in ${path.resolve(`${config.compressionPath}/${outputName}`)} 
              `);  
                resolve();
            })
            command.run();
        });    

    } else if(profileChoice == 6){
        let customCrfValue
        while(true){
            console.log(`
Enter a custom crf value that ranges from 0 to 51:
    Examples: (18),(23), (number)
            `)
            customCrfValue = prompt().trim()
            if((0 <= customCrfValue && customCrfValue <= 51)){
                console.log(`
Setting the crf value to ${customCrfValue}
                `)
                break;
            }
            console.log(`
Invalid input. Try again
            `)
        }
        await new Promise((resolve, reject) => {
            let command = ffmpeg(`${videoPathAndName}`);
            command.output(`${config.compressionPath}/${outputName}`)
            command.addOption(`-map 0`);
            command.videoCodec(`${config.ffmpegCodec}`);
            command.addOption(`-preset ${config.compressionPreset}`)
            command.addOption(`-threads ${config.numberOfThreads}`)
            if(!config.compressAudioToo){
                command.addOption(`-c:a copy`)
            }

            /*
            This is what get change for each profile.
            */
            command.addOption(`-crf ${customCrfValue}`) // Profile 6

            command.on('error', (error) => {
                console.log(`
an error occured while compressing ${videoName}
    Error message: ${error}
                `)
                reject();
            });
            command.on('progress', (progress) => {
                logUpdate(`
Currently compressing ${videoName}
${buildLoadingMessage(progress)}
                `);
            })                                    
            command.on('end', () => {
                console.log(`
The video has been compressed!
    It's located in ${path.resolve(`${config.compressionPath}/${outputName}`)} 
              `);  
                resolve();
            })
            command.run();
        });    


    } else {
        console.log(`Invalid option.. returning`)
        return
    }

    const compressedVideoDetails = await getVideoinfo(`${config.compressionPath}/${outputName}`)
    let sizeBefore = toBeCompressedVideoDetails.size
    let sizeAfter = compressedVideoDetails.size
    await logInfo(toBeCompressedVideoDetails, compressedVideoDetails, profileChoice)
    printSizeDiff(sizeBefore, sizeAfter, false)
    return true
}

//This is option 2: Compress a directory of videos
async function compressDirectory() {

    const config = readConfig()
    if(!config) return

    let PathToCompress = getPathFromUser()
    if (!PathToCompress) {
        return
    }
    let DirectoryName = path.basename(PathToCompress) //myVideos

    dirOutputName = DirectoryName + `-compressed` //myVideos-compressed
    let remainingVideos = []
    if (isCompressed(dirOutputName)) {
        /*
        If the provided directory is compressed, the app will check if all videos -
        in that directory has been compressed or not.
            if all videos hasn't been compressed, the app will get all the videos that didn't get -
            compressed and ask the user if he wants to compress them.

            if all videos has been compressed, the app wil inform the user and ask -
            them if they want to re-compress it again.
        */ 
        let files = fs.readdirSync(PathToCompress)
        let onlyVideosFiles = []
        for(let i = 0; i < files.length; i++){
            if(isVideo(files[i])){
                onlyVideosFiles.push(files[i])
            }
        }

        let jsonString = fs.readFileSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`, "UTF8")
        let alreadyCompressedVideos = JSON.parse(jsonString) //alreadyCompressedVideos is an array
        let isOverwrited = false
        if(alreadyCompressedVideos.length == onlyVideosFiles.length){
            //This will happen if all videos on that directory has been compressed
            if (!await isUserWantOverwrite(dirOutputName)) {
                return
            }
            fs.unlinkSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`)
            isOverwrited = true
        }
        // The loop is for getting the remaining videos.
        for (let i = 0; i < onlyVideosFiles.length; i++) {
            let isCompressedBool = false;
            for (let j = 0; j < alreadyCompressedVideos.length; j++) {
              let nameWithoutSuffix = alreadyCompressedVideos[j].replace(/-compressed\.mp4$/, ".mp4");
              if (onlyVideosFiles[i] === nameWithoutSuffix) {
                isCompressedBool = true;
                break;
              }
            }
            if (!isCompressedBool) {
              remainingVideos.push(onlyVideosFiles[i]);
            }
        }
          

        
          
        if(!isOverwrited){
            //This will happen only if some of the videos in that directory has been compressed
            console.log(`
Tried to compress this directory "${DirectoryName}" before,
but ${remainingVideos.length} out of ${onlyVideosFiles.length} videos on this directory hasn't been compressed.
            `)
            let continueChouce;
            //let isOkay = false;
            while(true){
                console.log(`
Do you want to continue compressing?
    [1]: Yes, continue from where you stop
    [2]: No, return to main menu
    [3]: List the uncompressed videos 
                `)
                continueChouce = prompt().trim();
    
                if(continueChouce == 1){
                    //isOkay = true;
                    break;
                } else if(continueChouce == 2){
                    console.log(`
Exiting.. returning to main menu
                    `)
                    return;
                } else if(continueChouce == 3){
                    for(let i = 0; i < remainingVideos.length; i++){
                        console.log(`${remainingVideos[i]}`)
                    }
                } else {
                    console.log(`
Invalid option, try again
                    `)
                }    
            }     
        }
    }

    if(!fs.existsSync(`${config.compressionPath}/${dirOutputName}`)){
        fs.mkdirSync(`${config.compressionPath}/${dirOutputName}`)
    }
    if(!fs.existsSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`)){
        let arrayOfNames = []
        let jsonString = JSON.stringify(arrayOfNames, null, 2)
        fs.writeFileSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`, jsonString)    
    }

    //This is technically where it's all starts
    let files = fs.readdirSync(PathToCompress)
    let videosToCompress = []

    if(remainingVideos.length > 0){
        //This will happen if this directory has been compressed and didn't complete
        for (let i = 0; i < remainingVideos.length; i++) {
            if(isVideo(remainingVideos[i])){
                videosToCompress.push(remainingVideos[i])
                console.log(`Added (${remainingVideos[i]}) to the list`)    
            }
        }    
    } else {
        //This will happen if this directory has never been compressed.
        for (let i = 0; i < files.length; i++) {
            if (isVideo(files[i])) {
                videosToCompress.push(files[i])
                console.log(`Added (${files[i]}) to the list`)
            }
        }    
    }
    if(videosToCompress.length == 0){
        console.log(`
There are no videos in ${path.resolve(PathToCompress)}
        `)
        return
    }
    console.log(`\n
Found ${videosToCompress.length} videos to compress in ${DirectoryName}
    `)

    console.log(`
Please choose your profile
    General-purposes options:
        [1]: High Quality (-crf 18)
        [2]: Balanced (-crf 23)
        [3]: Small Size (-crf 28)

    More-specefic senarios
        [4]: Animation (good for cartoons/animes)
        [5]: Still images (good for slideshow-like content)
        [6]: Custom crf value...
    `)
    let profileChoice = prompt().trim();
        
    /*
    I am not proud of the following code.
    But I spent a whole day trying to make it clean and avoid code duplication.
    This works and can arguably be efficient and readable.
    */
    if(profileChoice == 1){
        for(let i = 0; i < videosToCompress.length; i++){
            try {
                await new Promise((resolve, reject) => {
                    let individualVideoToCompressName = `${videosToCompress[i].slice(0, -4)}-compressed.mp4`
                    let command = ffmpeg(`${PathToCompress}/${videosToCompress[i]}`);
                    command.output(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`)
                    command.addOption(`-map 0`);
                    command.videoCodec(`${config.ffmpegCodec}`);
                    command.addOption(`-preset ${config.compressionPreset}`)
                    command.addOption(`-threads ${config.numberOfThreads}`)
                    if(!config.compressAudioToo){
                        command.addOption(`-c:a copy`)
                    }

                    /*
                    This is what get change for each profile.
                    */
                    command.addOption(`-crf 18`) // Profile 1

                    command.on('error', (error) => {
                        reject(error);
                    });
                    command.on('progress', (progress) => {
                        logUpdate(`
Video ${i + 1} out of ${videosToCompress.length}
${buildLoadingMessage(progress)}
                        `);
                    })                                    
                    command.on('end', async () => {
                        let jsonString = fs.readFileSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`, "UTF8")
                        let compressionProgress = JSON.parse(jsonString)
                        compressionProgress.push(individualVideoToCompressName)
                        jsonString = JSON.stringify(compressionProgress, null, 2)
                        fs.writeFileSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`, jsonString)
                        
                        let oldVideo = await getVideoinfo(`${PathToCompress}/${videosToCompress[i]}`);
                        let newVideo = await getVideoinfo(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`);
                        await logInfo(oldVideo, newVideo, profileChoice);
                        
                        console.log(`
The video number ${i + 1} has been compressed!
        It's located in: ${path.resolve(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`)}
                        
                        
                        
                        `);
                        resolve();
                    })
                    command.run();
                });    
            } catch(error) {
                console.log(`
An error occurred while processing ${videosToCompress[i]}.
This may be due to ${videosToCompress[i]} being a corrupted video.
The program will continue compressing the other videos.
The error mesage: ${error.message}



                `)
            }
        }
    } else if(profileChoice == 2){
        for(let i = 0; i < videosToCompress.length; i++){
            try {
                await new Promise((resolve, reject) => {
                    let individualVideoToCompressName = `${videosToCompress[i].slice(0, -4)}-compressed.mp4`
                    let command = ffmpeg(`${PathToCompress}/${videosToCompress[i]}`);
                    command.output(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`)
                    command.addOption(`-map 0`);
                    command.videoCodec(`${config.ffmpegCodec}`);
                    command.addOption(`-preset ${config.compressionPreset}`)
                    command.addOption(`-threads ${config.numberOfThreads}`)
                    if(!config.compressAudioToo){
                        command.addOption(`-c:a copy`)
                    }
                    
                    /*
                    This is what get change for each profile.
                    */
                    command.addOption(`-crf 23`) // Profile 2

                    command.on('error', (error) => {
                        reject(error);
                    });
                    command.on('progress', (progress) => {
                        logUpdate(`
Video ${i + 1} out of ${videosToCompress.length}
${buildLoadingMessage(progress)}
                        `);
                    })                                    
                    command.on('end', async () => {
                        let jsonString = fs.readFileSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`, "UTF8")
                        let compressionProgress = JSON.parse(jsonString)
                        compressionProgress.push(individualVideoToCompressName)
                        jsonString = JSON.stringify(compressionProgress, null, 2)
                        fs.writeFileSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`, jsonString)
                        
                        let oldVideo = await getVideoinfo(`${PathToCompress}/${videosToCompress[i]}`);
                        let newVideo = await getVideoinfo(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`);
                        await logInfo(oldVideo, newVideo, profileChoice);
                        
                        console.log(`
The video number ${i + 1} has been compressed!
    It's located in: ${path.resolve(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`)}
                        
                        
                        
                        `);
                        resolve();
                    })
                    command.run();
                });    
            } catch(error) {
                console.log(`
An error occurred while processing ${videosToCompress[i]}.
This may be due to ${videosToCompress[i]} being a corrupted video.
The program will continue compressing the other videos.
The error mesage: ${error.message}



                `)
            }
        }

    } else if(profileChoice == 3){
        for(let i = 0; i < videosToCompress.length; i++){
            try {
                await new Promise((resolve, reject) => {
                    let individualVideoToCompressName = `${videosToCompress[i].slice(0, -4)}-compressed.mp4`
                    let command = ffmpeg(`${PathToCompress}/${videosToCompress[i]}`);
                    command.output(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`)
                    command.addOption(`-map 0`);
                    command.videoCodec(`${config.ffmpegCodec}`);
                    command.addOption(`-preset ${config.compressionPreset}`)
                    command.addOption(`-threads ${config.numberOfThreads}`)
                    if(!config.compressAudioToo){
                        command.addOption(`-c:a copy`)
                    }
                    
                    /*
                    This is what get change for each profile.
                    */
                    command.addOption(`-crf 28`) // Profile 3

                    command.on('error', (error) => {
                        reject(error);
                    });
                    command.on('progress', (progress) => {
                        logUpdate(`
Video ${i + 1} out of ${videosToCompress.length}
${buildLoadingMessage(progress)}
                        `);
                    })                                    
                    command.on('end', async () => {
                        let jsonString = fs.readFileSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`, "UTF8")
                        let compressionProgress = JSON.parse(jsonString)
                        compressionProgress.push(individualVideoToCompressName)
                        jsonString = JSON.stringify(compressionProgress, null, 2)
                        fs.writeFileSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`, jsonString)
                        
                        let oldVideo = await getVideoinfo(`${PathToCompress}/${videosToCompress[i]}`);
                        let newVideo = await getVideoinfo(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`);
                        await logInfo(oldVideo, newVideo, profileChoice);

                        console.log(`
The video number ${i + 1} has been compressed!
        It's located in: ${path.resolve(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`)}
                        
                        
                        
                        `);
                        resolve();
                    })
                    command.run();
                });    
            } catch(error) {
                console.log(`
An error occurred while processing ${videosToCompress[i]}.
This may be due to ${videosToCompress[i]} being a corrupted video.
The program will continue compressing the other videos.
The error mesage: ${error.message}



                `)
            }
        }

    } else if(profileChoice == 4){
        for(let i = 0; i < videosToCompress.length; i++){
            try {
                await new Promise((resolve, reject) => {
                    let individualVideoToCompressName = `${videosToCompress[i].slice(0, -4)}-compressed.mp4`
                    let command = ffmpeg(`${PathToCompress}/${videosToCompress[i]}`);
                    command.output(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`)
                    command.addOption(`-map 0`);
                    command.videoCodec(`${config.ffmpegCodec}`);
                    command.addOption(`-preset ${config.compressionPreset}`)
                    command.addOption(`-threads ${config.numberOfThreads}`)
                    if(!config.compressAudioToo){
                        command.addOption(`-c:a copy`)
                    }
                    
                    /*
                    This is what get change for each profile.
                    */
                    command.addOption(`-tune animation`) // Profile 4

                    command.on('error', (error) => {
                        reject(error);
                    });
                    command.on('progress', (progress) => {
logUpdate(`
Video ${i + 1} out of ${videosToCompress.length}
${buildLoadingMessage(progress)}
                        `);
                    })                                    
                    command.on('end', async () => {
                        let jsonString = fs.readFileSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`, "UTF8")
                        let compressionProgress = JSON.parse(jsonString)
                        compressionProgress.push(individualVideoToCompressName)
                        jsonString = JSON.stringify(compressionProgress, null, 2)
                        fs.writeFileSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`, jsonString)
                        
                        let oldVideo = await getVideoinfo(`${PathToCompress}/${videosToCompress[i]}`);
                        let newVideo = await getVideoinfo(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`);
                        await logInfo(oldVideo, newVideo, profileChoice);

                        console.log(`
The video number ${i + 1} has been compressed!
        It's located in: ${path.resolve(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`)}
                        
                        
                        
                        `);
                        resolve();
                    })
                    command.run();
                });    
            } catch(error) {
                console.log(`
An error occurred while processing ${videosToCompress[i]}.
This may be due to ${videosToCompress[i]} being a corrupted video.
The program will continue compressing the other videos.
The error mesage: ${error.message}



                `)
            }
        }
    } else if(profileChoice == 5){
        for(let i = 0; i < videosToCompress.length; i++){
            try {
                await new Promise((resolve, reject) => {
                    let individualVideoToCompressName = `${videosToCompress[i].slice(0, -4)}-compressed.mp4`
                    let command = ffmpeg(`${PathToCompress}/${videosToCompress[i]}`);
                    command.output(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`)
                    command.addOption(`-map 0`);
                    command.videoCodec(`${config.ffmpegCodec}`);
                    command.addOption(`-preset ${config.compressionPreset}`)
                    command.addOption(`-threads ${config.numberOfThreads}`)
                    if(!config.compressAudioToo){
                        command.addOption(`-c:a copy`)
                    }
                    
                    /*
                    This is what get change for each profile.
                    */
                    command.addOption(`-tune stillimage`) // Profile 5

                    command.on('error', (error) => {
                        reject(error);
                    });
                    command.on('progress', (progress) => {
                        logUpdate(`
Video ${i + 1} out of ${videosToCompress.length}
${buildLoadingMessage(progress)}
                        `);
                    })                                    
                    command.on('end', async () => {
                        let jsonString = fs.readFileSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`, "UTF8")
                        let compressionProgress = JSON.parse(jsonString)
                        compressionProgress.push(individualVideoToCompressName)
                        jsonString = JSON.stringify(compressionProgress, null, 2)
                        fs.writeFileSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`, jsonString)
                        
                        let oldVideo = await getVideoinfo(`${PathToCompress}/${videosToCompress[i]}`);
                        let newVideo = await getVideoinfo(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`);
                        await logInfo(oldVideo, newVideo, profileChoice);

                        console.log(`
The video number ${i + 1} has been compressed!
        It's located in: ${path.resolve(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`)}
                        
                        
                        
                        `);
                        resolve();
                    })
                    command.run();
                });    
            } catch(error) {
                console.log(`
An error occurred while processing ${videosToCompress[i]}.
This may be due to ${videosToCompress[i]} being a corrupted video.
The program will continue compressing the other videos.
The error mesage: ${error.message}



                `)
            }
        }

    } else if(profileChoice == 6){
        let customCrfValue
        while(true){
            console.log(`
Enter a custom crf value that ranges from 0 to 51:
    Examples: (18),(23), (number)
            `)
            customCrfValue = prompt().trim()
            if((0 <= customCrfValue && customCrfValue <= 51)){
                console.log(`
Setting the crf value to ${customCrfValue}
                `)
                break;
            }
            console.log(`
Invalid input. Try again
            `)
        }
        for(let i = 0; i < videosToCompress.length; i++){
            try {
                await new Promise((resolve, reject) => {
                    let individualVideoToCompressName = `${videosToCompress[i].slice(0, -4)}-compressed.mp4`
                    let command = ffmpeg(`${PathToCompress}/${videosToCompress[i]}`);
                    command.output(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`)
                    command.addOption(`-map 0`);
                    command.videoCodec(`${config.ffmpegCodec}`);
                    command.addOption(`-preset ${config.compressionPreset}`)
                    command.addOption(`-threads ${config.numberOfThreads}`)
                    if(!config.compressAudioToo){
                        command.addOption(`-c:a copy`)
                    }
                    
                    /*
                    This is what get change for each profile.
                    */
                    command.addOption(`-crf ${customCrfValue}`) // Profile 6

                    command.on('error', (error) => {
                        reject(error);
                    });
                    command.on('progress', (progress) => {
logUpdate(`
Video ${i + 1} out of ${videosToCompress.length}
${buildLoadingMessage(progress)}
                        `);
                    })                                    
                    command.on('end', async () => {
                        let jsonString = fs.readFileSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`, "UTF8")
                        let compressionProgress = JSON.parse(jsonString)
                        compressionProgress.push(individualVideoToCompressName)
                        jsonString = JSON.stringify(compressionProgress, null, 2)
                        fs.writeFileSync(`${config.compressionPath}/${dirOutputName}/compressionProgress.json`, jsonString)
                        
                        let oldVideo = await getVideoinfo(`${PathToCompress}/${videosToCompress[i]}`);
                        let newVideo = await getVideoinfo(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`);
                        await logInfo(oldVideo, newVideo, profileChoice);

                        console.log(`
The video number ${i + 1} has been compressed!
        It's located in: ${path.resolve(`${config.compressionPath}/${dirOutputName}/${individualVideoToCompressName}`)}
                        
                        
                        
                        `);
                        resolve();
                    })
                    command.run();
                });    
            } catch(error) {
                console.log(`
An error occurred while processing ${videosToCompress[i]}.
This may be due to ${videosToCompress[i]} being a corrupted video.
The program will continue compressing the other videos.
The error mesage: ${error.message}



                `)
            }
        }

    } else {
        console.log(`Invalid option.. returning`)
        return
    }
    let filesBeforeCompression = fs.readdirSync(`${PathToCompress}`)
    let sizeBefore = 0
    let filesAfterCompression = fs.readdirSync(`${config.compressionPath}/${dirOutputName}`)
    let sizeAfter = 0
    for (let i = 0; i < filesBeforeCompression.length; i++) {
        if (isVideo(filesBeforeCompression[i])) {
            let currentStat = fs.statSync(`${PathToCompress}/${filesBeforeCompression[i]}`)
            sizeBefore += currentStat.size
        }
    }
    for (let i = 0; i < filesAfterCompression.length; i++) {
        if (isVideo(filesAfterCompression[i])) {
            let currentStat = fs.statSync(`${config.compressionPath}/${dirOutputName}/${filesAfterCompression[i]}`)
            sizeAfter += currentStat.size
        }
    }
    printSizeDiff(sizeBefore, sizeAfter, true)
    return;
}

//This is option 3: View compression history
async function printLog(){
    const config = readConfig()
    let log_path = `./compression_log.json`;
    let logFile = JSON.parse(fs.readFileSync(config.compressionHistory))
    if(logFile.length == 0){
        console.log("You haven't compressed any video using VideoSqueeze-CLI");
        return;
    }
    let totalOldSize = 0;
    let totalNewSize = 0;
    for(i = 0; i < logFile.length; i++){
        totalOldSize += logFile[i].oldVideo.size;
        totalNewSize += logFile[i].newVideo.size;
    }
    let totalSaved = totalOldSize - totalNewSize;
    if(totalSaved < 0){
        console.log(`
This is wierd, you compressed ${logFile.length} videos using VideoSqueeze-CLI, but somehow you gained ${bytes(Math.abs(totalSaved))} in space.
You can see all the videos in ${config.compressionHistory}
`);
        return;
    }
    console.log(`
You have used VideoSqueeze-CLI to compress ${logFile.length} videos.
You have saved total of ${bytes((totalOldSize - totalNewSize))} in space!
You can see all the videos in ${config.compressionHistory}
    `)
return;
}



module.exports = {
    compressVideo,
    compressDirectory,
    printLog
}





