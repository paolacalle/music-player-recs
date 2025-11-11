import React from "react";
import {Play, Pause, Next, Previous} from './IconButtons';
import {MusicPlayerContent} from './MusicPlayerContent';
import TransportBar from './TransportBar';
import {fetchTrackBySearch} from './AudioPlayerProvider';

const MusicPlayer = ({ searchTerm }) => {
    const [track, setTrack] = React.useState(null); // current track state

    const loadTrack = async (searchTerm) => {
        const fetchedTrack = await fetchTrackBySearch(searchTerm);
        setTrack(fetchedTrack);
    };

    // hardcoded for demo purposes
    React.useEffect(() => {
        loadTrack(searchTerm);
    }, []);

    // console.log("Current Track:", track);

    return <div className ="music-player-container">
        <h1>Music Player</h1>
        <div className="music-player-wrapper">
            {/* Music player UI elements will go here */}
            <div className="content-wrapper">
                <MusicPlayerContent 
                    trackTitle ={track?.trackTitle}
                    trackArtist ={track?.trackArtist}
                    album ={track?.album}
                    year ={track?.year}
                    coverURL ={track?.coverURL}
                    duration ={track?.duration}
                    audioURL ={track?.audioURL}
                    isPlaying={true}
                    currentTime={100}
                    onSeek={(time) => console.log(`Seeking to ${time} seconds`)}
                />
            </div>
            {/* Controls */}
            <div className="controls-wrapper">
                <TransportBar 
                    currentTime={100}
                    duration={240}
                    onSeek={(time) => console.log(`Seeking to ${time} seconds`)}
                />
            </div>
        </div>
    </div>
}

export default MusicPlayer; // exporting allowing import in other files