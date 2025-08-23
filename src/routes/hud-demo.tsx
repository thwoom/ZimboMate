import React from 'react'
import { HudLayout, HudContent, HudGrid } from '../ui/hud/HudLayout'
import { HudPanelV2 } from '../ui/hud/HudPanelV2'
import { HudButton } from '../ui/hud/HudButton'
import { HudTextV2 } from '../ui/hud/HudTextV2'

export default function HudDemo() {
  return (
    <HudLayout 
      title="ZimboMate" 
      subtitle="Advanced System Interface"
      showHeader={true}
      showFooter={true}
    >
      <HudContent>
        {/* Welcome Section */}
        <HudPanelV2
          title="System Overview"
          subtitle="Welcome to the future of interface design"
          decor="🚀"
          frameType="corners"
          glowIntensity="medium"
        >
          <HudTextV2 
            effect="typewriter"
            className="text-lg text-gray-200 mb-4"
          >
            Experience the next generation of user interfaces with Arwes-powered components.
            This demo showcases clean layouts, proper spacing, and subtle animations.
          </HudTextV2>
          
          <div className="flex gap-4">
            <HudButton variant="primary" size="large">
              Get Started
            </HudButton>
            <HudButton variant="secondary" size="large">
              Learn More
            </HudButton>
          </div>
        </HudPanelV2>

        {/* Feature Grid */}
        <HudGrid cols={2}>
          <HudPanelV2
            title="Responsive Design"
            frameType="octagon"
            glowIntensity="low"
          >
            <HudTextV2 effect="fade" className="text-gray-300">
              Built with modern CSS Grid and Flexbox for perfect responsiveness across all devices.
            </HudTextV2>
          </HudPanelV2>

          <HudPanelV2
            title="Smooth Animations"
            frameType="nero"
            glowIntensity="low"
          >
            <HudTextV2 effect="fade" className="text-gray-300">
              Powered by Arwes animations and Motion One for fluid, performant transitions.
            </HudTextV2>
          </HudPanelV2>

          <HudPanelV2
            title="Theme System"
            frameType="kranox"
            glowIntensity="low"
          >
            <HudTextV2 effect="fade" className="text-gray-300">
              Consistent theming with Arwes color utilities and design tokens.
            </HudTextV2>
          </HudPanelV2>

          <HudPanelV2
            title="Accessibility"
            frameType="lines"
            glowIntensity="low"
          >
            <HudTextV2 effect="fade" className="text-gray-300">
              Built with accessibility in mind, supporting keyboard navigation and screen readers.
            </HudTextV2>
          </HudPanelV2>
        </HudGrid>

        {/* Controls Section */}
        <HudPanelV2
          title="Interactive Controls"
          subtitle="Test the various button styles and interactions"
          frameType="corners"
          glowIntensity="medium"
        >
          <div className="space-y-6">
            <div>
              <HudTextV2 effect="none" className="text-sm text-gray-400 mb-3 uppercase tracking-wider">
                Button Variants
              </HudTextV2>
              <div className="flex flex-wrap gap-3">
                <HudButton variant="primary">Primary</HudButton>
                <HudButton variant="secondary">Secondary</HudButton>
                <HudButton variant="danger">Danger</HudButton>
                <HudButton variant="success">Success</HudButton>
              </div>
            </div>

            <div>
              <HudTextV2 effect="none" className="text-sm text-gray-400 mb-3 uppercase tracking-wider">
                Button Sizes
              </HudTextV2>
              <div className="flex flex-wrap gap-3 items-center">
                <HudButton variant="primary" size="small">Small</HudButton>
                <HudButton variant="primary" size="medium">Medium</HudButton>
                <HudButton variant="primary" size="large">Large</HudButton>
              </div>
            </div>

            <div>
              <HudTextV2 effect="none" className="text-sm text-gray-400 mb-3 uppercase tracking-wider">
                Special States
              </HudTextV2>
              <div className="flex flex-wrap gap-3">
                <HudButton variant="primary" disabled>Disabled</HudButton>
                <HudButton variant="primary" fullWidth>Full Width</HudButton>
              </div>
            </div>
          </div>
        </HudPanelV2>

        {/* Text Effects Demo */}
        <HudPanelV2
          title="Text Effects"
          subtitle="Showcasing various text animation effects"
          frameType="octagon"
          glowIntensity="low"
        >
          <div className="space-y-4">
            <HudTextV2 
              effect="typewriter"
              className="text-xl text-[#54DAD0] font-bold"
            >
              Typewriter Effect
            </HudTextV2>
            
            <HudTextV2 
              effect="decipher"
              className="text-lg text-[#8ff6ff]"
            >
              Decipher Effect
            </HudTextV2>
            
            <HudTextV2 
              effect="fade"
              className="text-base text-gray-300"
            >
              Fade Effect
            </HudTextV2>
            
            <HudTextV2 
              effect="slide"
              className="text-base text-gray-300"
            >
              Slide Effect
            </HudTextV2>
          </div>
        </HudPanelV2>
      </HudContent>
    </HudLayout>
  )
}
