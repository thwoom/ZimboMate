import { createPanel, PanelProps } from '../../framework/Panel';
import { createPanelAPI } from '../../framework/PanelAPI';
import { BondTracker } from '../../components/BondTracker';
import { bondService } from '../../services/BondService';
import { useCharacter } from '../../store/GameStore';
import './BondTrackerPanel.css';

const id = 'bond-tracker';

const api = createPanelAPI(id);

const BondTrackerPanelComponent: React.FC < PanelProps> = ({ isActive, onStateChange }) => {
  const currentCharacter = useCharacter();

  const handleBondResolved = (bondId: string, xpGained: number) => {
    // Notify the game system that XP was gained
    // You could integrate this with your XP system here
    // For example: xpService.addXP(currentCharacter.id, xpGained, 'bond_resolution');

    // Update panel state if needed
    if (onStateChange) {
      onStateChange({ lastBondResolved: bondId, xpGained });
    }
  };

  return (
    <div className="bond-tracker-panel">
      <div className="bond-tracker-panel__header">
        <h2>🔗 Bond Tracker</h2>
        <p className="bond-tracker-panel__subtitle">
          Manage character relationships and earn XP through bonds
        </p>
      </div>

      <div className="bond-tracker-panel__content">
        <BondTracker
          characterId={currentCharacter?.id}
          onBondResolved={handleBondResolved}
        />
      </div>
    </div>
  );
};

const bondTrackerPanelConfig = createPanel(
  {
    id,
    name: 'Bond Tracker',
    description: 'Manage character bonds and relationships for XP',
    icon: '🔗',
    priority: 30,
    preload: true,
  },
  BondTrackerPanelComponent,
  {
    onMount: () => {
      },
    onUnmount: () => {
      },
    onActivate: () => {
      },
    onDeactivate: () => {
      },
  },
);

export default bondTrackerPanelConfig;
