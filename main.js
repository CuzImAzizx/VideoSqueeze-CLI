/*
This is the main file where you can run the app using node: `node main.js`.
You can run the app on any platform. All what you need is to install the packages `npm i`.
"@ffmpeg-installer/ffmpeg" will determine and install the appropriate ffmpeg for your system.
*/

const prompt = require("prompt-sync")({ sigint: true })
const { compressVideo, compressDirectory } = require('./compressManager.js');
const fs = require('fs')
const path = require('path');
const ffmpeg = require('fluent-ffmpeg')

//The main menu.
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
[9]: Exit the program
`)
    let option = prompt()
    option.trim()
    if (option == 1) {
        await compressVideo()
    } else if (option == 2) {
        await compressDirectory()
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
    pause()
    start()
}

// a pause function. so the user can read the termenal before going to the next operation
function pause() {
    console.log(`
Press any button to continue..
    `)
    prompt()
    return
}

//Read the config.json and return it as object
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


// If the config.json is missing, will attempt to create it with the default values.
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
        compressionPreset: "faster"      
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


/*
You can safely change the ffmpeg and ffprobe paths to yours from here
Replace "require('@ffmpeg-installer/ffmpeg').path" to `/Your/ffmpeg-ffprobe/path`
*/
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
ffmpeg.setFfmpegPath(ffmpegPath)
console.log(`
Set the ffmpeg path successfully to ${ffmpegPath}
`)

const ffprobPath = require('@ffprobe-installer/ffprobe').path
ffmpeg.setFfprobePath(ffprobPath)
console.log(`
Set the ffprob path successfully to ${ffprobPath}
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
Error creating ${configFile.compressionPath}:
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




//Finally, start the app
start()