import { FloatingFrame } from '../FloatingFrame';
import { HudTextV2 } from '../HudTextV2';

export function InventoryPanel() {
  return (
    <FloatingFrame x={68} y={15} w={28} h={40}>
      <HudTextV2.Hero className="mb-4">Inventory</HudTextV2.Hero>
      <div className="space-y-2">
        <HudTextV2>Plasma Rifle x1</HudTextV2>
        <HudTextV2>Energy Cells x24</HudTextV2>
        <HudTextV2>Med Kit x3</HudTextV2>
        <HudTextV2>Nano Repair Kit x1</HudTextV2>
        <HudTextV2>Quantum Beacon x1</HudTextV2>
        <HudTextV2>Credits: 1,247</HudTextV2>
      </div>
    </FloatingFrame>
  );
}
