/*
This is the main that will be packeged into exe. It's different from main.js It meant-
to be run on Windows only.
*/

const prompt = require("prompt-sync")({ sigint: true })
const { compressVideo, compressDirectory, printLog } = require('./compressManager.js');
const fs = require('fs')
const path = require('path');
const ffmpeg = require('fluent-ffmpeg')


async function start() {
    console.log(`\n\n\n\n\n`)
    console.log(`
┏╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍┑
╎ ____      ___     _            _____                                  ╎
╎ \\ \\ \\    / (_)   ╎ ╎          / ____╎                                 ╎
╎  \\ \\ \\  / / _  __╎ ╎ ___  ___╎ (___   __ _ _   _  ___  ___ _______    ╎
╎   \\ \\ \\/ / ╎ ╎/ _\` ╎/ _ \\/ _ \\\\___ \\ / _\` ╎ ╎ ╎ ╎/ _ \\/ _ \\_  / _ \\   ╎
╎    \\ \\  /  ╎ ╎ (_╎ ╎  __/ (_) ╎___) ╎ (_╎ ╎ ╎_╎ ╎  __/  __// /  __/   ╎
╎     \\_\\/   ╎_╎\\__,_╎\\___╎\\___/_____/ \\__, ╎\\__,_╎\\___╎\\___/___\\___╎   ╎
╎                                         ╎ ╎                           ╎
╎                                         ╎_╎                           ╎
╎                                                                       ╎
╎ Simple CLI video compression tool.                                    ╎
┗╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍┛
`);



    console.log(`
Welcome to VideoSqueeze! Please select your option

[1]: Compress a single video
[2]: Compress a directory of videos
[3]: View compression history
[9]: Exit the program
`)
    let option = prompt()
    option.trim()
    try {
        if (option == 1) {
            await compressVideo()
        } else if (option == 2) {
            await compressDirectory()
        } else if (option == 3) {
            await printLog();
        } else if (option == 9) {
            console.log(`
    Good bye <3
            `)
            process.exit(0)
        } else {
            console.log(`
    ${option} is an invalid entry..
            `)
        }    
    } catch(error){
        console.log(`
\n\n
##############################################################################################
An Error occured.
Sorry, but an unexpected error occured while processing your video. This might because a bug in the code.
Here's the error message:

\`\`\`
${error}
\`\`\`

Please share this with me in github using the following link:
https://github.com/CuzImAzizx/VideoSqueeze-CLI/issues/new?assignees=&labels=bug&projects=&template=bug-report.md&title=Encountered+a+bug+while+using+VideoSqueeze-CLI

Alternatively, you can try following these troubleshooting steps:
    1: Try restarting the app

    2: Try deleting the config file, then restart the app.
        It's located in "./config.json"

    3: Try deleting the compression history file, then restart the app.
        It's usally located in "./compression_log.json" 
    
    4: Try deleting the compression history file. Then restart the app.
        It's usally located in "./compression_log.json"

    5: Try pulling/downloading the new project files from the repository.
        The link to the repo: https://github.com/CuzImAzizx/VideoSqueeze-CLI

    6: Start fresh.
        Download/clone the project from the start.
##############################################################################################
\n\n
`)
    }
    pause()
    start()
}

function pause() {
    console.log(`
Press any button to continue..
    `)
    prompt()
    return
}

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



if(!fs.existsSync(`./config.json`)){
    console.log(`
Warning: Didn't find ./config.json
    Creating ./config.json with the defaults values.. 
    `)
    const defaultConfiguration = {
        PathToFfmpegForExe: "./ffmpeg/bin/ffmpeg.exe",
        PathToFfprobeForExe: "./ffmpeg/bin/ffprobe.exe",
        compressionPath: "./compressed_videos",
        numberOfThreads: 0,
        ffmpegCodec: "libx264",
        compressAudioToo: false,
        compressionPreset: "faster",
        compressionHistory: "./compression_log.json"
    }
    try{
        let jsonString = JSON.stringify(defaultConfiguration, null, 2)
        fs.writeFileSync(`./config.json`, jsonString)
        console.log(`
successfully created ./config.json
        `)    
    } catch(error) {
        console.log(`
Couldn't create ./config.json
    ${error}
        `)
        console.log("Press enter to exit")
        prompt()    
        process.exit(1)
    }
}



// If the user set something in the config.json to "C:\users\name\desktop", this will change it to "C:\\users\\name\\desktop"
// basically turn every \ to \\ 
let tempConfigData = fs.readFileSync('./config.json', 'utf8');
tempConfigData = tempConfigData.replace(/\\\\|\\/g, (match) => {
    return match === '\\' ? '\\\\' : match;
});
fs.writeFileSync('./config.json', tempConfigData);        

let configFile = readConfig()
if(!configFile){
    console.log("Press enter to exit")
    prompt()
    process.exit(1)
}

console.log(`
./config.json is successfully loaded
`)

// Create compression_log.json if it doesn't exist.
if(!fs.existsSync(configFile.compressionHistory)){
    console.log(`
Warning: Didn't find ${configFile.compressionHistory}
    Creating ${configFile.compressionHistory} with empty log.. 
    `)   
    try {
        fs.writeFileSync(configFile.compressionHistory, `[]`);
        console.log(`
Successfully created ${configFile.compressionHistory}
        `);    
    } catch(error) {
        console.log(`
Couldn't create ${configFile.compressionHistory}
    ${error}
        `)            
    }   
}
console.log(`
${configFile.compressionHistory} is successfully loaded
`)


//If compression directory isn't there, the app will create it.
if(!fs.existsSync(`${configFile.compressionPath}`)){
    console.log(`
Warning: Didn't find ${configFile.compressionPath}
Creating ${configFile.compressionPath}..
    `)
    try{
        fs.mkdirSync(configFile.compressionPath, { recursive: true });
        console.log(`
Successfully created ${configFile.compressionPath}
      `);
  
    } catch (error) {
        console.error(`
Couldn't create ${configFile.compressionPath}:
    ${error}
        `);
        console.log("Press enter to exit")
        prompt()    
        process.exit(1);
      }    
}

console.log(`
${configFile.compressionPath} is successfully loaded
`)


if(!fs.existsSync(`${configFile.PathToFfmpegForExe}`)){
    console.log(`
Couldn't find ${path.basename(configFile.PathToFfmpegForExe)} in ${path.resolve(configFile.PathToFfmpegForExe)}
    ffmpeg.exe is important for this app to function.

        if you HAVE ffmpeg.exe in another path:
            1- Update config.json "PathToFfmpegForExe" value to the path of your ffmpeg.exe

        if you DON'T HAVE ffmpeg at all:
            1- Download ffmpeg for windows (https://www.gyan.dev/ffmpeg/builds/ffmpeg-git-essentials.7z)
            2- Extract the downloaded file
            3- Locate ffmpeg.exe
            4- Copy ffmpeg.exe path (e.g: C:\\Users\\yourname\\Downloads\\ffmpeg\\bin\\ffmpeg.exe)
            5- Paste the path to config.json "PathToFfmpegForExe" value.
                Example:    "PathToFfmpegForExe": "C:\\Users\\yourname\\Downloads\\ffmpeg\\bin\\ffmpeg.exe",
            6- Restart the app
`)
    console.log("Press enter to exit")
    prompt()
    process.exit(1)
}
const ffmpegPath = `${configFile.PathToFfmpegForExe}`
ffmpeg.setFfmpegPath(ffmpegPath)
console.log(`
${path.basename(configFile.PathToFfmpegForExe)} is successfully loaded
`)

if(!fs.existsSync(`${configFile.PathToFfprobeForExe}`)){
    console.log(`
Couldn't find ${path.basename(configFile.PathToFfprobeForExe)} in ${path.resolve(configFile.PathToFfprobeForExe)}
    ffprobe.exe is important for this app to function.

        if you HAVE ffprobe.exe in another path:
            1- Update config.json "PathToFfprobeForExe" value to the path of your ffprobe.exe

        if you DON'T HAVE ffmpeg at all:
            1- Download ffmpeg for windows (https://www.gyan.dev/ffmpeg/builds/ffmpeg-git-essentials.7z)
            2- Extract the downloaded file
            3- Locate ffprobe.exe
            4- Copy ffprobe.exe path (e.g: C:\\Users\\yourname\\Downloads\\ffmpeg\\bin\\ffprobe.exe)
            5- Paste the path to config.json "PathToFfprobeForExe" value.
                Example:    "PathToFfprobeForExe": "C:\\Users\\yourname\\Downloads\\ffmpeg\\bin\\ffprobe.exe",
            6- Restart the app
        `)
    console.log("Press enter to exit")
    prompt()
    process.exit(1)
}

const ffprobPath = `${configFile.PathToFfprobeForExe}`
ffmpeg.setFfprobePath(ffprobPath)
console.log(`
${path.basename(configFile.PathToFfprobeForExe)} is successfully loaded
`)


start()