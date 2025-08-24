import { FloatingFrame } from '../FloatingFrame';
import { HudTextV2 } from '../HudTextV2';

export function MissionPanel() {
  return (
    <FloatingFrame x={35} y={55} w={30} h={35}>
      <HudTextV2.Hero className="mb-4">Current Mission</HudTextV2.Hero>
      <div className="space-y-2">
        <HudTextV2>Objective: Secure the Artifact</HudTextV2>
        <HudTextV2>Location: Sector 7-Alpha</HudTextV2>
        <HudTextV2>Progress: 73% Complete</HudTextV2>
        <HudTextV2>Time Remaining: 14:32</HudTextV2>
        <HudTextV2>Threat Level: High</HudTextV2>
      </div>
    </FloatingFrame>
  );
}
