// TransportBar.jsx
// 'use client'
import React, { useRef, useState } from 'react';
import { Play, Pause, Next, Previous } from './IconButtons';
import '../styles/icon-button.css'; // make sure this path is correct

export default function TransportBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

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
    <div className="flex flex-col items-center gap-4 mt-8">
      {/* Dummy audio so you can verify it works (replace with your video/audio ref) */}
      <audio
        ref={audioRef}
        src="https://file-examples.com/storage/fe2f5c5c5a8dc4c5f3b4bb1/2017/11/file_example_MP3_700KB.mp3"
        preload="none"
      />

      <div className="flex items-center justify-center gap-3">
        <Previous onClick={() => console.log('prev')} />
        {isPlaying
          ? <Pause onClick={handlePlayPause} active />
          : <Play  onClick={handlePlayPause} active />
        }
        <Next onClick={() => console.log('next')} />
      </div>

      <div className="text-xs opacity-70">
        State: {isPlaying ? 'Playing' : 'Paused'}
      </div>
    </div>
  );
}
