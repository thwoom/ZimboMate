import { Background } from '../ui/arwes/Background';
import { FloatingFrame } from '../ui/hud/FloatingFrame';
import { HudTextV2 } from '../ui/hud/HudTextV2';

export default function HudDemoPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <Background />
      
      {/* Character Sheet Panel */}
      <FloatingFrame x={5} y={10} w={25} h={35}>
        <HudTextV2 
          as="h2" 
          effect="decipher"
          className="text-xl font-bold mb-4 text-[#54DAD0]"
          style={{
            textShadow: '0 0 10px rgba(84, 218, 208, 0.5)'
          }}
        >
          Character Sheet
        </HudTextV2>
        <HudTextV2 effect="fade" className="text-sm text-gray-300 space-y-2">
          <div>Name: Zimbo</div>
          <div>Class: Navigator</div>
          <div>Level: 42</div>
          <div className="mt-4">
            <div>STR: 15</div>
            <div>DEX: 18</div>
            <div>INT: 12</div>
            <div>WIS: 14</div>
          </div>
        </HudTextV2>
      </FloatingFrame>
      
      {/* Inventory Panel */}
      <FloatingFrame x={68} y={15} w={28} h={40}>
        <HudTextV2 
          as="h2" 
          effect="decipher"
          className="text-xl font-bold mb-4 text-[#8ff6ff]"
          style={{
            textShadow: '0 0 10px rgba(143, 246, 255, 0.5)'
          }}
        >
          Inventory
        </HudTextV2>
        <HudTextV2 effect="typewriter" className="text-sm text-gray-300">
          <div className="space-y-2">
            <div>• Quantum Scanner</div>
            <div>• Energy Shield Mk.V</div>
            <div>• Nano-repair Kit x3</div>
            <div>• Data Crystal x7</div>
            <div>• Ration Pack x10</div>
          </div>
        </HudTextV2>
      </FloatingFrame>
      
      {/* Map/Mission Panel */}
      <FloatingFrame x={30} y={55} w={40} h={38}>
        <HudTextV2 
          as="h2" 
          effect="decipher"
          className="text-xl font-bold mb-4 text-[#54DAD0]"
          style={{
            textShadow: '0 0 10px rgba(84, 218, 208, 0.5)'
          }}
        >
          Current Mission
        </HudTextV2>
        <HudTextV2 effect="slide" className="text-sm text-gray-300">
          <div className="mb-3">
            <strong className="text-[#8ff6ff]">Objective:</strong> Investigate anomaly in Sector 7-G
          </div>
          <div className="space-y-1 text-xs">
            <div>□ Reach observation point</div>
            <div>☑ Scan for energy signatures</div>
            <div>□ Collect data samples</div>
            <div>□ Report findings to base</div>
          </div>
          <div className="mt-4 p-3 bg-[#54DAD0] bg-opacity-10 rounded">
            <div className="text-xs uppercase tracking-wider text-[#54DAD0]">Navigation Data</div>
            <div className="mt-2 font-mono text-xs">
              <div>X: 127.45 | Y: -89.12 | Z: 45.67</div>
              <div>Heading: 315° | Speed: 0.7c</div>
            </div>
          </div>
        </HudTextV2>
      </FloatingFrame>
      
      {/* Status Panel */}
      <FloatingFrame x={3} y={65} w={22} h={28}>
        <HudTextV2 
          as="h2" 
          effect="decipher"
          className="text-lg font-bold mb-3 text-[#8ff6ff]"
          style={{
            textShadow: '0 0 10px rgba(143, 246, 255, 0.5)'
          }}
        >
          System Status
        </HudTextV2>
        <HudTextV2 effect="none" className="text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Shield:</span>
            <span className="text-green-400">98%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Hull:</span>
            <span className="text-green-400">100%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Power:</span>
            <span className="text-yellow-400">76%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">O₂:</span>
            <span className="text-green-400">Good</span>
          </div>
        </HudTextV2>
      </FloatingFrame>
    </div>
  );
}
