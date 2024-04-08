async function getElement(selector: string, delay = 10, maxAttempts = 10): Promise<Element> {
    return new Promise((resolve, reject) => {
        let attempts = 0;

        function search() {
            const element = document.querySelector(selector);
            attempts++;

            if (element) {
                resolve(element);
                console.log(`Element ${selector} found after ${attempts} attempts.`);
            } else if (attempts < maxAttempts) {
                setTimeout(search, delay);
                delay *= 2; // Double the delay for exponential backoff
            } else {
                console.warn(`Element ${selector} not found after ${maxAttempts} attempts.`);
                reject();
            }
        }

        search();
    });
}


async function getChannelName(): Promise<string | undefined> {
    const channelElement = await getElement(".ytd-channel-name") as HTMLElement | null;
    return channelElement?.innerText;
}

const END_CARD_DURATION = 21;  // 20 seconds + 1 second for good measure

getElement(".video-stream").then(async (video: Element) => {
    if (await getChannelName() !== 'Scott Manley') {
        console.log('Not a Scott Manley video, exiting.');
        return;
    }

    const videoElement = video as HTMLVideoElement;

    // listen for time updates
    video.addEventListener('timeupdate', function () {
        const currentTime = videoElement.currentTime;
        const duration = videoElement.duration;
        const timeLeft = duration - currentTime;

        if (timeLeft <= END_CARD_DURATION) {
            console.log('Pausing video');
            videoElement.pause();
        }
    });

});
