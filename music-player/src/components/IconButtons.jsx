// Controls.jsx
import React from 'react';
import { PlayCircle, PauseCircle, SkipForward, SkipBack } from 'lucide-react';

function IconButton({ Icon, onClick, label, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`icon-button inline-flex items-center justify-center rounded-full p-2 text-black hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/30 ${className}`}
    >
      <Icon className="w-7 h-7" />
    </button>
  );
}

export function Play({ onClick }) {
  return <IconButton Icon={PlayCircle} onClick={onClick} label="Play" />;
}

export function Pause({ onClick }) {
  return <IconButton Icon={PauseCircle} onClick={onClick} label="Pause" />;
}

export function Next({ onClick }) {
  return <IconButton Icon={SkipForward} onClick={onClick} label="Next" />;
}

export function Previous({ onClick }) {
  return <IconButton Icon={SkipBack} onClick={onClick} label="Previous" />;
}

