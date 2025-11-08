// IconButtons.jsx
import React from 'react';
import { PlayCircle, PauseCircle, SkipForward, SkipBack } from 'lucide-react';

function IconButton({ Icon, onClick, label, className = '', disabled = false, active = false, size = 'md' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      size={size}
      className={`icon-button ${size} ${active ? 'is-active' : ''} ${className}`}
    >
      <Icon className="w-10 h-10" />
    </button>
  );
}

export function Play({ onClick, disabled, active }) {
  return <IconButton Icon={PlayCircle} onClick={onClick} label="Play" disabled={disabled} active={active} size='lg' />;
}
export function Pause({ onClick, disabled, active }) {
  return <IconButton Icon={PauseCircle} onClick={onClick} label="Pause" disabled={disabled} active={active} size="lg" />;
}
export function Next({ onClick, disabled, active }) {
  return <IconButton Icon={SkipForward} onClick={onClick} label="Next" disabled={disabled} active={active} />;
}
export function Previous({ onClick, disabled, active }) {
  return <IconButton Icon={SkipBack} onClick={onClick} label="Previous" disabled={disabled} active={active} />;
}
// You can add more icon buttons as needed