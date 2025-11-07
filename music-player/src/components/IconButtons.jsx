// IconButtons.jsx
import React from 'react';
import { PlayCircle, PauseCircle, SkipForward, SkipBack } from 'lucide-react';

function IconButton({ Icon, onClick, label, className = '', disabled = false, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={`icon-button md ${active ? 'is-active' : ''} ${className}`}
    >
      <Icon className="w-7 h-7" />
    </button>
  );
}

export function Play({ onClick, disabled, active }) {
  return <IconButton Icon={PlayCircle} onClick={onClick} label="Play" disabled={disabled} active={active} />;
}
export function Pause({ onClick, disabled, active }) {
  return <IconButton Icon={PauseCircle} onClick={onClick} label="Pause" disabled={disabled} active={active} />;
}
export function Next({ onClick, disabled, active }) {
  return <IconButton Icon={SkipForward} onClick={onClick} label="Next" disabled={disabled} active={active} />;
}
export function Previous({ onClick, disabled, active }) {
  return <IconButton Icon={SkipBack} onClick={onClick} label="Previous" disabled={disabled} active={active} />;
}
// You can add more icon buttons as needed