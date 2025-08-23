import { useSoundToggle } from '../../ui/arwes/ArwesProviders';

export default function SoundToggle() {
  const { enabled, toggle } = useSoundToggle();
  return (
    <button 
      onClick={toggle} 
      title={enabled ? 'Mute' : 'Unmute'}
      className="p-2 rounded bg-gray-800 hover:bg-gray-700 text-white transition-colors"
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  );
}
