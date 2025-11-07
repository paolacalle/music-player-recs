import React from "react";

const MusicPlayer = () => {
    return <div className ="music-player-container">
        <h1>Music Player</h1>
        <div className="music-player-wrapper">
            {/* Music player UI elements will go here */}
            <div className="music-player-content">
                <img src='' alt='' className="music-cover" />
                <div className="title-wrapper">
                    <h2 className="track-title">Track Title</h2>
                </div>
                <p className="track-artist">Artist Name</p>
            </div>

            {/* Controls */}
            <div className="controls">
                
            </div>
        </div>
    </div>
}

export default MusicPlayer; // exporting allowing import in other files