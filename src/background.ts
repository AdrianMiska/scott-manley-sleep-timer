'use strict';

import {loadImageData} from "./helpers";

// this handles grey-out of icons on unsupported sites
chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(async () => {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {urlMatches: 'https://.*\.youtube\.com'},
                    })
                ],
                actions: [
                    new chrome.declarativeContent.SetIcon({
                        imageData: {
                            16: await loadImageData("images/clock_16.png"),
                            32: await loadImageData("images/clock_32.png"),
                            48: await loadImageData("images/clock_48.png"),
                            128: await loadImageData("images/clock_128.png")
                        }
                    }),
                ]
            }
        ]);
    });
});

const END_CARD_DURATION = 20000;  // 20 seconds
const BUFFER = 1000;  // 1 second


// cannot use async/await here since the message port listening for the response will time out
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    chrome.tabs.query({active: true, currentWindow: true}, async function (tabs) {
        const tabId = tabs[0].id;
        if (!tabId) throw new Error(`This tab does not have a tab id, unable to run the extension on tabs without an id`);
        let playbackState = request.state;
        let endTime = request.endTime - END_CARD_DURATION - BUFFER;
        console.log("Ending at: " + new Date(endTime).toLocaleTimeString());
        switch (playbackState) {
            case "playing":
                console.log(`start alarm for tab ${tabId}`)
                chrome.alarms.create(String(tabId), {when: endTime});
                sendResponse();
                break;
            case "paused":
                console.log(`cancel alarm for tab ${tabId}`)
                await deleteAlarm(tabId);
                sendResponse();
                break;
            default:
                console.log('invalid msg');
                sendResponse();
        }
    });
    return true;
});

// https://developer.chrome.com/docs/extensions/reference/alarms/#method-create
// There's a 1-minute delay for alarms api if not running unpacked
chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log(`alarm for tab ${alarm.name} triggered, pausing playback`);
    await chrome.scripting.executeScript({
        target: {tabId: parseInt(alarm.name)},
        func: pausePlayback
    });
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    console.log(`tab ${tabId} was removed, delete it's corresponding alarm`)
    await deleteAlarm(tabId);
});

const pausePlayback = () => {
    const playPause = <HTMLButtonElement>document.getElementsByClassName('ytp-play-button')[0];
    if (playPause.getAttribute('title')?.includes('Pause')) {
        playPause.click();
    }
}

async function deleteAlarm(tabId: number) {
    await chrome.alarms.clear(String(tabId));
    console.log(`deleted alarm for tab id: ${tabId}`)
}