interface SoundToggleProps {
  on: boolean;
  onToggle: () => void;
}

export function SoundToggle({ on, onToggle }: SoundToggleProps) {
  return (
    <button
      type="button"
      className={`sound ${on ? 'is-on' : ''}`}
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? 'Mute sound' : 'Play sound'}
    >
      <span className="sound__bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="sound__label">{on ? 'Sound on' : 'Sound off'}</span>
    </button>
  );
}
