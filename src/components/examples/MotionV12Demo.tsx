/**
 * Motion v12 Demo Component for ZimboMate
 * 
 * This component demonstrates Motion v12 patterns and best practices
 * for the ZimboMate Space-HUD interface.
 */

import React, { useState, useRef } from 'react';
import { animate, spring, stagger } from 'motion';

// Sanity check for motion compatibility (dev only)
if (import.meta.env.DEV) {
  console.log(
    "[motion compat]",
    typeof animate,
    typeof spring,
    typeof stagger
  ); // expect: function function function
}
import { 
  hudAnimations, 
  sequenceBuilders, 
  motionTokens, 
  inertiaPresets,
  useReducedMotion,
  animationUtils,
  type AnimationControls 
} from '../../lib/motion-utils';

export const MotionV12Demo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeAnimations, setActiveAnimations] = useState<AnimationControls[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const diceRef = useRef<HTMLDivElement>(null);
  
  const reducedMotion = useReducedMotion();

  // Example 1: Basic panel animation
  const handlePanelToggle = async () => {
    if (!panelRef.current) return;

    if (isVisible) {
      const exitAnimation = hudAnimations.panelExit(panelRef.current, {
        direction: 'down'
      });
      setActiveAnimations(prev => [...prev, exitAnimation]);
      await exitAnimation.finished;
      setIsVisible(false);
    } else {
      setIsVisible(true);
      // Wait for React to render the element
      setTimeout(() => {
        if (panelRef.current) {
          const entryAnimation = hudAnimations.panelEntry(panelRef.current, {
            direction: 'up'
          });
          setActiveAnimations(prev => [...prev, entryAnimation]);
        }
      }, 0);
    }
  };

  // Example 2: Staggered list animation
  const handleListAnimation = () => {
    if (!listRef.current) return;

    const items = listRef.current.querySelectorAll('.list-item');
    const staggerAnimation = hudAnimations.listStagger(Array.from(items));
    setActiveAnimations(prev => [...prev, staggerAnimation]);
  };

  // Example 3: Button press feedback
  const handleButtonPress = () => {
    if (!buttonRef.current) return;

    const pressAnimation = hudAnimations.buttonPress(buttonRef.current);
    setActiveAnimations(prev => [...prev, pressAnimation]);
  };

  // Example 4: Dice roll animation
  const handleDiceRoll = () => {
    if (!diceRef.current) return;

    const rollAnimation = hudAnimations.diceRoll(diceRef.current, {
      rolls: 3
    });
    setActiveAnimations(prev => [...prev, rollAnimation]);
  };

  // Example 5: Complex sequence animation
  const handleComplexSequence = () => {
    const elements = {
      background: '.demo-background',
      portrait: '.demo-portrait', 
      stats: '.demo-stat',
      moves: '.demo-move'
    };

    const sequenceAnimation = sequenceBuilders.characterSheetReveal(elements);
    setActiveAnimations(prev => [...prev, sequenceAnimation]);
  };

  // Example 6: Inertia-based drag simulation
  const handleInertiaDemo = () => {
    if (!panelRef.current) return;

    // Simulate a drag release with inertia
    const inertiaAnimation = animate(panelRef.current, {
      x: 200
    }, inertiaPresets.bouncy);
    
    setActiveAnimations(prev => [...prev, inertiaAnimation]);

    // Reset position after animation
    inertiaAnimation.finished.then(() => {
      if (panelRef.current) {
        animate(panelRef.current, { x: 0 }, { 
          duration: motionTokens.duration.normal 
        });
      }
    });
  };

  // Animation control functions
  const pauseAll = () => animationUtils.pauseAll(activeAnimations);
  const resumeAll = () => animationUtils.resumeAll(activeAnimations);
  const cancelAll = () => {
    animationUtils.cancelAll(activeAnimations);
    setActiveAnimations([]);
  };

  return (
    <div className="p-8 space-y-6 bg-[#001215] text-[#54DAD0] min-h-screen">
      <div className="demo-background opacity-0">
        <h1 className="text-3xl font-bold mb-2">Motion v12 Demo</h1>
        <p className="text-[#54DAD0]/70 mb-6">
          Demonstrating Motion v12 patterns for ZimboMate Space-HUD
          {reducedMotion && " (Reduced Motion Mode)"}
        </p>
      </div>

      {/* Animation Controls */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={pauseAll}
          className="px-4 py-2 bg-[#54DAD0]/20 hover:bg-[#54DAD0]/30 rounded transition-colors"
        >
          Pause All
        </button>
        <button
          onClick={resumeAll}
          className="px-4 py-2 bg-[#54DAD0]/20 hover:bg-[#54DAD0]/30 rounded transition-colors"
        >
          Resume All
        </button>
        <button
          onClick={cancelAll}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors"
        >
          Cancel All
        </button>
      </div>

      {/* Example 1: Panel Toggle */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Panel Entry/Exit Animation</h2>
        <button
          onClick={handlePanelToggle}
          className="px-4 py-2 bg-[#54DAD0]/20 hover:bg-[#54DAD0]/30 rounded transition-colors"
        >
          {isVisible ? 'Hide Panel' : 'Show Panel'}
        </button>
        
        {isVisible && (
          <div
            ref={panelRef}
            className="p-6 bg-[#54DAD0]/10 border border-[#54DAD0]/30 rounded-lg"
          >
            <h3 className="text-lg font-medium mb-2">HUD Panel</h3>
            <p className="text-[#54DAD0]/70">
              This panel demonstrates the hudAnimations.panelEntry() and panelExit() functions.
            </p>
          </div>
        )}
      </div>

      {/* Example 2: Staggered List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Staggered List Animation</h2>
        <button
          onClick={handleListAnimation}
          className="px-4 py-2 bg-[#54DAD0]/20 hover:bg-[#54DAD0]/30 rounded transition-colors"
        >
          Animate List
        </button>
        
        <div ref={listRef} className="space-y-2">
          {['Character Stats', 'Inventory Items', 'Available Moves', 'Session Notes'].map((item, index) => (
            <div
              key={index}
              className="list-item p-3 bg-[#54DAD0]/10 border border-[#54DAD0]/20 rounded opacity-0"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Example 3: Button Press Feedback */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Button Press Feedback</h2>
        <button
          ref={buttonRef}
          onClick={handleButtonPress}
          className="px-6 py-3 bg-[#54DAD0]/20 hover:bg-[#54DAD0]/30 rounded-lg transition-colors font-medium"
        >
          Press Me!
        </button>
      </div>

      {/* Example 4: Dice Roll */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Dice Roll Animation</h2>
        <button
          onClick={handleDiceRoll}
          className="px-4 py-2 bg-[#54DAD0]/20 hover:bg-[#54DAD0]/30 rounded transition-colors"
        >
          Roll Dice
        </button>
        
        <div
          ref={diceRef}
          className="w-16 h-16 bg-[#54DAD0]/20 border-2 border-[#54DAD0]/50 rounded-lg flex items-center justify-center text-2xl font-bold"
        >
          🎲
        </div>
      </div>

      {/* Example 5: Complex Sequence */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Complex Sequence Animation</h2>
        <button
          onClick={handleComplexSequence}
          className="px-4 py-2 bg-[#54DAD0]/20 hover:bg-[#54DAD0]/30 rounded transition-colors"
        >
          Character Sheet Reveal
        </button>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="demo-portrait opacity-0 p-4 bg-[#54DAD0]/10 border border-[#54DAD0]/20 rounded">
            <div className="w-16 h-16 bg-[#54DAD0]/30 rounded-full mb-2"></div>
            <p>Character Portrait</p>
          </div>
          
          <div className="space-y-2">
            {['Strength: 16', 'Dexterity: 14', 'Constitution: 13'].map((stat, index) => (
              <div
                key={index}
                className="demo-stat opacity-0 p-2 bg-[#54DAD0]/10 border border-[#54DAD0]/20 rounded"
              >
                {stat}
              </div>
            ))}
          </div>
          
          <div className="col-span-2 space-y-2">
            {['Hack and Slash', 'Volley', 'Defend'].map((move, index) => (
              <div
                key={index}
                className="demo-move opacity-0 p-3 bg-[#54DAD0]/10 border border-[#54DAD0]/20 rounded"
              >
                {move}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Example 6: Inertia Demo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Inertia Animation (Drag Simulation)</h2>
        <button
          onClick={handleInertiaDemo}
          className="px-4 py-2 bg-[#54DAD0]/20 hover:bg-[#54DAD0]/30 rounded transition-colors"
        >
          Simulate Drag Release
        </button>
        <p className="text-sm text-[#54DAD0]/70">
          This demonstrates inertia-based movement using Motion's inertia presets.
        </p>
      </div>

      {/* Motion Information */}
      <div className="mt-12 p-6 bg-[#54DAD0]/5 border border-[#54DAD0]/20 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Motion Configuration</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium mb-2">Current Settings:</h3>
            <ul className="space-y-1 text-[#54DAD0]/70">
              <li>Reduced Motion: {reducedMotion ? 'Enabled' : 'Disabled'}</li>
              <li>Active Animations: {activeAnimations.length}</li>
              <li>Motion Library: Motion v12</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Available Presets:</h3>
            <ul className="space-y-1 text-[#54DAD0]/70">
              <li>Inertia: gentle, standard, strong, bouncy, floaty</li>
              <li>Springs: gentle, normal, snappy, bouncy</li>
              <li>Durations: instant, fast, normal, slow, slower</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotionV12Demo;
