import { VantaTopologyCDN } from '../ui/arwes/VantaTopologyCDN';
import { CharacterPanel } from '../ui/hud/panels/CharacterPanel';
import { InventoryPanel } from '../ui/hud/panels/InventoryPanel';
import { MissionPanel } from '../ui/hud/panels/MissionPanel';
import { StatusPanel } from '../ui/hud/panels/StatusPanel';

export default function HudDemoPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Beautiful Vanta.js background with topology, grid, dots, and falling lines */}
      <VantaTopologyCDN
        key="vanta-topology-cdn"
        color={0x139eb1} // Arwes teal color as hex
        backgroundColor={0x001215} // Dark Arwes background
        mouseControls={true}
        touchControls={true}
      />
      
      {/* Modular Arwes panel components with standardized positioning */}
      <CharacterPanel />
      <InventoryPanel />
      <MissionPanel />
      <StatusPanel />
    </div>
  );
}
