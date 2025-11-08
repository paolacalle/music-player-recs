import { Album } from "lucide-react";
import React from "react";

export const MusicPlayerContent = ({ 
    coverURL, // link to the album cover image
    trackTitle, // title of the track
    trackArtist, // artist of the track
    album, // album name
    year, // release year
    isPlaying, // playback status
    currentTime, // current playback time
    duration, // total track duration
    onSeek // function to handle seeking
}) => {
    return (
        <div className="music-player-content">
            <img src={coverURL} alt={`Cover of ${album}`} className="cover-image" />
            <div className="track-info">
                <h2 className="track-title">{trackTitle}</h2>
                <p className="track-artist">{trackArtist}</p>
                <p className="album-name">{album} ({year})</p>
            </div>
        </div>
    );
};
