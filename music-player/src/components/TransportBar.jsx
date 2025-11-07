// TransportBar.jsx
// 'use client'
import React, { useRef, useState } from 'react';
import { Play, Pause, Next, Previous } from './IconButtons';
import '../styles/icon-button.css'; // make sure this path is correct

export default function TransportBar() {
    const [isPlaying, setIsPlaying] = useState(false); // current play state
    const audioRef = useRef(null); // ref to audio element (empty for now)

    const handlePlayPause = () => {
        // compute next value safely and sync media
        setIsPlaying(prev => {
            const next = !prev;
            const el = audioRef.current;
            if (el) {
                if (next) {
                    el.play().catch(err => console.error('play() failed:', err));
                } else {
                    el.pause();
                }
            }
            return next;
        });
    };

    return (
        <div className="flex flex-col items-center gap-8 mt-8">
            <div className="flex items-center justify-center gap-12 mt-12">
                <Previous onClick={() => console.log('prev')} />

                {isPlaying
                ? <Pause onClick={handlePlayPause} active />
                : <Play  onClick={handlePlayPause} active />
                }

                <Next onClick={() => console.log('next')} />
            </div>

            {/* for debugging */}
            <div className="text-xs opacity-70">
            State: {isPlaying ? 'Playing' : 'Paused'}
            </div>
        </div>
    );
}
