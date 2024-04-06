# Scott Manley Sleep Timer

A timer that pauses Scott Manley's videos right before the end, so you don't wake up from the sound of the end card.

## Usage

Follow the instructions under the [Setup](#setup) section to build the extension.
Then follow instructions [here](https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked) to load an unpacked extension.

Once the extension is loaded, open a Scott Manley video on YouTube, and the extension will automatically pause the video right before the end card.

## Setup

This project uses typescript and webpack to compile javascript files in to ./dist folder in the project root directory. 
After cloning the repo, run `npm install && npm run build` to compile the ts files into js, and load the dist folder as an unpacked extension.


## Licensing and Contributions

This project is a fork of [youtube-sleep-timer](https://github.com/snoringriceball/youtube-sleep-timer) by [snoringriceball](https://github.com/snoringriceball) licensed under CC BY-NC-SA 4.0.

Changes made to the original work include removing the action UI and instead triggering based on the playback state on the video.

This extension uses the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**, please see LICENSE.md for details.

In summary, the license allows sharing and contribution of the licensed material, but disallows all commercial use as opposed to open-source licenses.