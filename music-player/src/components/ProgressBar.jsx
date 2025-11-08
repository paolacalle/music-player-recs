// progress bar component to visualize and control track playback progress
import React from "react";

// format and structure the music player content
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const ProgressBar = ({ currentTime, duration, onSeek }) => {
    const handleChange = (e) => {
        // this will call the onSeek function passed 
        // as a prop with the new time
        onSeek(Number(e.target.value));
    };

    return (
        <div className="flex items-center justify-center gap-5 w-full">
            <span className="current-time">{formatTime(currentTime)}</span>
            {/* This input creates a slider */}
            <input
                type="range" 
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleChange}
                className="progress-slider"
            />
            <span className="duration"> {formatTime(duration)}</span>
        </div>
    );
}