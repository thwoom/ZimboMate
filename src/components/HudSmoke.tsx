import { Animator } from "@arwes/react-animator";
import { FrameCorners } from "@arwes/react-frames";

export default function HudSmoke() {
  return (
    <Animator>
      <div style={{ width: 320, padding: 16 }}>
        <FrameCorners>
          <div style={{ padding: 16 }}>HUD frame online</div>
                  </FrameCorners>
      </div>
    </Animator>
  );
}
