function waitForElement(selector: string, callback: (playButton: Element) => void, delay = 10, maxAttempts = 10) {
    let attempts = 0;

    function search() {
        const element = document.querySelector(selector);
        attempts++;

        if (element) {
            callback(element);
            console.log(`Element ${selector} found after ${attempts} attempts.`);
        } else if (attempts < maxAttempts) {
            setTimeout(search, delay);
            delay *= 2; // Double the delay for exponential backoff
        } else {
            console.warn(`Element ${selector} not found after ${maxAttempts} attempts.`);
        }
    }

    search();
}

function onPlayButtonTitleChange(mutationsList: MutationRecord[]) {

    if (getChannelName() !== 'Scott Manley') {
        return;
    }

    const currentTime = getVideoCurrentTime();
    const duration = getVideoDuration();
    const timeLeft = duration - currentTime;
    const endTime = new Date(Date.now() + timeLeft * 1000);

    for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
            const target = <HTMLButtonElement>mutation.target;
            const state = (target.title === 'Pause (k)') ? 'playing' : 'paused';
            chrome.runtime.sendMessage(
                {state: state, endTime: endTime.getTime()}
            );
        }
    }
}

function getVideoDuration() {
    const duration = document.getElementsByClassName('ytp-time-duration')[0];
    let textContent = duration.textContent;
    if (!textContent) {
        return 0;
    }
    const minutes = parseInt(textContent.split(':')[0]);
    const seconds = parseInt(textContent.split(':')[1]);
    return minutes * 60 + seconds;
}

function getVideoCurrentTime() {
    const currentTime = document.getElementsByClassName('ytp-time-current')[0];
    let textContent = currentTime.textContent;
    if (!textContent) {
        return 0;
    }
    const minutes = parseInt(textContent.split(':')[0]);
    const seconds = parseInt(textContent.split(':')[1]);
    return minutes * 60 + seconds;

}

function getChannelName() {
    const channelName = <HTMLDivElement>document.getElementsByClassName('ytd-channel-name')[0];
    return channelName.innerText;
}

waitForElement('.ytp-play-button', (playButton: Element) => {
    // Element is found, set up the observer
    const observer = new MutationObserver(onPlayButtonTitleChange);
    observer.observe(playButton, {
        attributes: true,
        attributeFilter: ['title']
    });
});
