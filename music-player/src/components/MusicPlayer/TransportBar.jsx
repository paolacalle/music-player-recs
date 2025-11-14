// TransportBar.jsx
// 'use client'
import React, { useRef, useState } from 'react';
import { Play, Pause, Next, Previous } from './IconButtons';
import '../../styles/icon-button.css'; // make sure this path is correct
import { ProgressBar } from './ProgressBar';

export default function TransportBar(
    { ref, currentTime = 0, duration = 0, onSeek }
) {
    const [isPlaying, setIsPlaying] = useState(false); // current play state
    const audioRef = ref;



    const handlePlayPause = () => {
        if (!audioRef || !audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pauseVideo();
        } else {
            audioRef.current.playVideo();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex flex-col items-center gap-8 mt-8">
            <div className="control-item icons-row">
                <Previous onClick={() => console.log('prev')} />

                {isPlaying
                ? <Pause onClick={handlePlayPause} active />
                : <Play  onClick={handlePlayPause} active />
                }

                <Next onClick={() => console.log('next')} />
            </div>

            {/* add the progress bar here */}
            <div className="control-item lower-divider">
                <ProgressBar 
                    currentTime={currentTime} 
                    duration={duration} 
                    onSeek={onSeek} 
                />
            </div>
        </div>
    );
}
