// ProgressBar.jsx
import React from "react";
import '../styles/slider.css';

function formatTime(seconds = 0) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Props:
 *  - currentTime (number)
 *  - duration (number)
 *  - onSeek (fn) --> called with new time in seconds
 *  - buffered (number, optional)  // seconds buffered
 *  - disabled (bool, optional)
 *  - moodColor (string, optional) // override progress color per vibe (e.g., '#60a5fa')
 */
export const ProgressBar = ({ currentTime = 0, duration = 0, onSeek, buffered = 0, disabled = false, moodColor }) => {
  const clampedTime = Math.max(0, Math.min(currentTime, duration || 0)); // ensure within bounds
  const progressPct = duration ? (clampedTime / duration) * 100 : 0; // percentage of track played
  const bufferPct = duration ? (Math.min(buffered, duration) / duration) * 100 : 0; // percentage buffered

  // CSS variables for dynamic styling
  const styleVars = {
    // progress/buffer for webkit path
    '--range-progress': `${progressPct}%`,
    '--range-buffer': `${bufferPct}%`,
    ...(moodColor ? { '--c-fill': moodColor, '--c-ring': `${moodColor}88` } : null),
  };

  const handleChange = (e) => {
    onSeek?.(Number(e.target.value));
  };

  // Render the progress bar with time indicators
  return (
    <div className="flex items-center justify-center gap-4 w-full">
      <span className="tabular-nums text-xs opacity-80 w-10 text-right">{formatTime(clampedTime)}</span>

      <input
        type="range"
        min={0}
        max={duration || 0}
        value={clampedTime}
        step="0.1"
        onChange={handleChange}
        className="progress-slider"
        style={styleVars}
        disabled={disabled}
        aria-label="Seek"
      />

      <span className="tabular-nums text-xs opacity-80 w-10">{formatTime(duration || 0)}</span>
    </div>
  );
};
