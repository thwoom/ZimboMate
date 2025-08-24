import { FloatingFrame } from '../FloatingFrame';
import { HudTextV2 } from '../HudTextV2';

export function StatusPanel() {
  return (
    <FloatingFrame x={8} y={55} w={22} h={30}>
      <HudTextV2.Hero className="mb-4">System Status</HudTextV2.Hero>
      <div className="space-y-2">
        <HudTextV2>Shield: Online</HudTextV2>
        <HudTextV2>Engines: 98% Efficiency</HudTextV2>
        <HudTextV2>Weapons: Armed</HudTextV2>
        <HudTextV2>Comms: Clear Signal</HudTextV2>
        <HudTextV2>Life Support: Nominal</HudTextV2>
      </div>
    </FloatingFrame>
  );
}
