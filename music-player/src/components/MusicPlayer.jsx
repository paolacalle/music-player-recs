import React from "react";
import {Play, Pause, Next, Previous} from './IconButtons';
import {MusicPlayerContent} from './MusicPlayerContent';
import TransportBar from './TransportBar';

const MusicPlayer = () => {
    return <div className ="music-player-container">
        <h1>Music Player</h1>
        <div className="music-player-wrapper">
            {/* Music player UI elements will go here */}
            <div className="content-wrapper">
                <MusicPlayerContent 
                    coverURL="https://example.com/cover.jpg"
                    trackTitle="Sample Track"
                    trackArtist="Sample Artist"
                    album="Sample Album"
                    year="2024"
                    isPlaying={true}
                    currentTime={100}
                    duration={240}
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