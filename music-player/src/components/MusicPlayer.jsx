import React from "react";
import {Play, Pause, Next, Previous} from './IconButtons';
import {MusicPlayerContent} from './MusicPlayerContent';
import TransportBar from './TransportBar';
import {fetchTrackBySearch} from './AudioPlayerProvider';
import SearchBar from "./SearchBar";
import YouTubeAudio from "./YoutubeAudio";

const MusicPlayer = () => {
    const [track, setTrack] = React.useState(null); // current track state

    const loadTrack = async (searchTerm) => {
        const fetchedTrack = await fetchTrackBySearch(searchTerm);
        setTrack(fetchedTrack);
    };

    // preload a default track on mount
    React.useEffect(() => {
        loadTrack("Never Gonna Give You Up");
    }, []);

    // console.log("Current Track:", track);

    return <div className ="music-player-container">
        <h1>Music Player</h1>
        <div className="search-wrapper">
            <SearchBar onSearch={loadTrack} />
        </div>
        <YouTubeAudio
            query={track ? `${track.trackTitle} ${track.trackArtist} official audio` : ""}
            durationSec={track ? Math.round((track.duration_ms ?? track.duration ?? 0) / 1000) : 0}
        />

        <div className="music-player-wrapper">
            {/* Music player UI elements will go here */}
            <div className="content-wrapper">
                <MusicPlayerContent
                    trackTitle={track?.trackTitle}
                    trackArtist={track?.trackArtist}
                    album={track?.album}
                    year={track?.year}
                    coverURL={track?.coverURL}
                    duration={track?.duration}
                    audioURL={track?.audioURL}
                    isPlaying={true}
                    currentTime={100}
                    onSeek={(time) => console.log(`Seeking to ${time} seconds`)}
                />
            </div>
            {/* Controls */}
            <div className="controls-wrapper">
                <TransportBar 
                    currentTime={100}
                    duration={track?.duration}
                    onSeek={(time) => console.log(`Seeking to ${time} seconds`)}
                />
            </div>
        </div>
    </div>
}

export default MusicPlayer; // exporting allowing import in other files