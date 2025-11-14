

// server/lib/youtubeSearch.mjs

export async function fetchHTML(url) {
    // This function fetches the HTML content of a YouTube search results page
    // The headers mimic a real browser to avoid being blocked by YouTube
    // We use user-agent and cookies for consent
    const res = await fetch(url, {
        headers: {
            "User-Agent": // user-agent string for a modern browser
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36", 
            Cookie: "CONSENT=YES+; SOCS=CAISNQgDEg..", // consent cookie
        },
    });
    return await res.text();
}

export async function findBestVideo(html, wantSec) {
    // This function parses the YouTube HTML and finds the best matching video
    // based on the desired duration (wantSec)

    const initialDataMatch = html.match(/var ytInitialData = (.*?});<\/script>/);
    if (!initialDataMatch) return null;

    const initialDataJson = initialDataMatch[1]; // extract JSON string from HTML
    const initialData = JSON.parse(initialDataJson);

    // extract video items from the parsed JSON structure
    // we flatten the contents to get all video renderers
    const videoItems =
        initialData.contents.twoColumnSearchResultsRenderer.primaryContents
        .sectionListRenderer.contents.flatMap(
            (section) => section.itemSectionRenderer?.contents || []
        )
        .map((item) => item.videoRenderer)
        .filter((vr) => vr !== undefined);

    // loop through video items to find the best match (based on duration)
    for (const video of videoItems) {
        const videoId = video.videoId;
        const lengthText = video.lengthText?.simpleText || "0:00";
        const parts = lengthText.split(":").map(Number);

        let durationSec = 0;
        if (parts.length === 3) {
        durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
        durationSec = parts[0] * 60 + parts[1];
        } else if (parts.length === 1) {
        durationSec = parts[0];
        }
        console.log(`Found videoId=${videoId} duration=${durationSec}s`);

        // check if this video matches the desired duration (within 10 seconds)
        if (wantSec === null || Math.abs(durationSec - wantSec) <= 10) {
        return { videoId, durationSec };
        }
    }

    return null; // no suitable video found
};