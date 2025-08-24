import { FloatingFrame } from '../FloatingFrame';
import { HudTextV2 } from '../HudTextV2';

export function CharacterPanel() {
  return (
    <FloatingFrame x={5} y={10} w={25} h={35}>
      <HudTextV2.Hero className="mb-4">Character Sheet</HudTextV2.Hero>
      <div className="space-y-2">
        <HudTextV2>Name: Commander Zara</HudTextV2>
        <HudTextV2>Level: 12</HudTextV2>
        <HudTextV2>Class: Space Marine</HudTextV2>
        <HudTextV2>Health: 85/100</HudTextV2>
        <HudTextV2>Energy: 67/80</HudTextV2>
        <HudTextV2>Experience: 2,847/3,000</HudTextV2>
      </div>
    </FloatingFrame>
  );
}
