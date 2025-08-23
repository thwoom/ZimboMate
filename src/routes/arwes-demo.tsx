import React from 'react'
import { Animator } from '@arwes/react-animator'
import { HudLayout, HudContent, HudGrid } from '../ui/hud/HudLayout'
import { HudPanelV2, HudCard, HudModal, HudAlert, HudSection } from '../ui/hud/HudPanelV2'
import { HudTextV2 } from '../ui/hud/HudTextV2'
import { HudButton, HudIconButton, HudToggleButton } from '../ui/hud/HudButton'

export default function ArwesDemo() {
  const [variant, setVariant] = React.useState<'cosmic' | 'moebius' | 'minimal'>('cosmic')
  const [showModal, setShowModal] = React.useState(false)
  const [selectedFrame, setSelectedFrame] = React.useState<string>('corners')

  return (
    <HudLayout 
      variant={variant}
      showHeader
      showSidebar
      showFooter
      title="Arwes Demo"
      subtitle="Futuristic UI Components"
    >
      <HudContent>
        {/* Theme Selector */}
        <HudSection title="Theme Variants" subtitle="Choose your visual style">
          <div className="flex gap-3">
            <HudToggleButton
              active={variant === 'cosmic'}
              onToggle={() => setVariant('cosmic')}
            >
              Cosmic
            </HudToggleButton>
            <HudToggleButton
              active={variant === 'moebius'}
              onToggle={() => setVariant('moebius')}
            >
              Moebius
            </HudToggleButton>
            <HudToggleButton
              active={variant === 'minimal'}
              onToggle={() => setVariant('minimal')}
            >
              Minimal
            </HudToggleButton>
          </div>
        </HudSection>

        {/* Text Effects Demo */}
        <HudSection title="Text Effects" subtitle="Various text animations">
          <div className="space-y-4">
            <div>
              <HudTextV2.Hero>
                Hero Text with Decipher Effect
              </HudTextV2.Hero>
            </div>
            
            <div>
              <HudTextV2 effect="typewriter" speed="slow">
                This text appears with a typewriter effect at slow speed.
              </HudTextV2>
            </div>
            
            <div>
              <HudTextV2 effect="fade">
                This text fades in smoothly.
              </HudTextV2>
            </div>
            
            <div>
              <HudTextV2 effect="slide">
                This text slides in from below.
              </HudTextV2>
            </div>
            
            <div>
              <HudTextV2.Glow color="#ff6b5e">
                Glowing text with custom color
              </HudTextV2.Glow>
            </div>
            
            <div>
              <HudTextV2.Code>
                const code = "This is code text with typewriter effect";
              </HudTextV2.Code>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Counter Demo:</span>
              <HudTextV2.Counter 
                from={0} 
                to={1337} 
                duration={2000}
                prefix="Score: "
                className="text-cyan-400 font-mono"
              />
            </div>
          </div>
        </HudSection>

        {/* Frame Types Demo */}
        <HudSection title="Frame Types" subtitle="Different panel styles">
          <HudGrid cols={3}>
            <Animator>
              <HudCard 
                title="Corners Frame" 
                subtitle="Default style"
                decor="◆"
              >
                <p className="text-sm">
                  This is the default corners frame style with low glow intensity.
                </p>
              </HudCard>
            </Animator>

            <Animator>
              <HudPanelV2 
                title="Octagon Frame" 
                frameType="octagon"
                glowIntensity="medium"
              >
                <p className="text-sm">
                  Octagonal frame with medium glow effect.
                </p>
              </HudPanelV2>
            </Animator>

            <Animator>
              <HudPanelV2 
                title="Nero Frame" 
                frameType="nero"
                glowIntensity="high"
              >
                <p className="text-sm">
                  Nero frame style with high glow intensity.
                </p>
              </HudPanelV2>
            </Animator>

            <Animator>
              <HudPanelV2 
                title="Kranox Frame" 
                frameType="kranox"
              >
                <p className="text-sm">
                  Kranox frame with unique corner design.
                </p>
              </HudPanelV2>
            </Animator>

            <Animator>
              <HudPanelV2 
                title="Lines Frame" 
                frameType="lines"
              >
                <p className="text-sm">
                  Simple lines frame for subtle separation.
                </p>
              </HudPanelV2>
            </Animator>

            <Animator>
              <HudPanelV2 
                title="Custom Frame" 
                frameType="custom"
              >
                <p className="text-sm">
                  Custom hexagonal frame design.
                </p>
              </HudPanelV2>
            </Animator>
          </HudGrid>
        </HudSection>

        {/* Button Variants */}
        <HudSection title="Interactive Buttons" subtitle="Click and hover interactions">
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <HudButton variant="primary">
                Primary Action
              </HudButton>
              <HudButton variant="secondary">
                Secondary
              </HudButton>
              <HudButton variant="danger">
                Danger Zone
              </HudButton>
              <HudButton variant="success">
                Success
              </HudButton>
              <HudButton disabled>
                Disabled
              </HudButton>
            </div>

            <div className="flex gap-3 items-center">
              <span className="text-sm text-gray-400">Sizes:</span>
              <HudButton size="small">Small</HudButton>
              <HudButton size="medium">Medium</HudButton>
              <HudButton size="large">Large</HudButton>
            </div>

            <div className="flex gap-3">
              <HudIconButton icon="⚙️" />
              <HudIconButton icon="📊" variant="secondary" />
              <HudIconButton icon="⚠️" variant="danger" />
              <HudIconButton icon="✓" variant="success" />
            </div>

            <div>
              <HudButton 
                fullWidth 
                variant="primary"
                onClick={() => setShowModal(true)}
              >
                Open Modal Dialog
              </HudButton>
            </div>
          </div>
        </HudSection>

        {/* Alert Examples */}
        <HudAlert title="System Alert" subtitle="Critical information">
          <HudTextV2.Alert>
            Warning: System resources running low. Consider optimizing your configuration.
          </HudTextV2.Alert>
        </HudAlert>

        {/* Data Display */}
        <HudSection title="Data Visualization" subtitle="Real-time metrics">
          <HudGrid cols={4}>
            <DataCard 
              label="CPU Usage" 
              value={78} 
              unit="%" 
              status="warning" 
            />
            <DataCard 
              label="Memory" 
              value={4.2} 
              unit="GB" 
              status="normal" 
            />
            <DataCard 
              label="Network" 
              value={156} 
              unit="Mbps" 
              status="good" 
            />
            <DataCard 
              label="Storage" 
              value={89} 
              unit="%" 
              status="critical" 
            />
          </HudGrid>
        </HudSection>

        {/* Modal Demo */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <Animator>
              <div className="max-w-lg w-full">
                <HudModal 
                  title="Modal Dialog" 
                  subtitle="Interactive overlay"
                >
                  <div className="space-y-4">
                    <HudTextV2 effect="decipher">
                      This is a modal dialog with an octagonal frame and high glow intensity.
                    </HudTextV2>
                    <HudTextV2>
                      Modals can contain any content and are perfect for focused interactions.
                    </HudTextV2>
                    <div className="flex gap-3 justify-end mt-6">
                      <HudButton 
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                      >
                        Cancel
                      </HudButton>
                      <HudButton 
                        variant="primary"
                        onClick={() => setShowModal(false)}
                      >
                        Confirm
                      </HudButton>
                    </div>
                  </div>
                </HudModal>
              </div>
            </Animator>
          </div>
        )}
      </HudContent>
    </HudLayout>
  )
}

// Data card component
const DataCard: React.FC<{
  label: string
  value: number
  unit: string
  status: 'normal' | 'good' | 'warning' | 'critical'
}> = ({ label, value, unit, status }) => {
  const statusColors = {
    normal: '#54DAD0',
    good: '#4caf50',
    warning: '#ff9800',
    critical: '#f44336'
  }

  const color = statusColors[status]

  return (
    <HudCard>
      <div className="text-center">
        <HudTextV2 
          effect="none" 
          className="text-xs text-gray-400 uppercase tracking-wider mb-2"
        >
          {label}
        </HudTextV2>
        <div 
          className="text-3xl font-bold"
          style={{ 
            color,
            textShadow: `0 0 20px ${color}80`
          }}
        >
          <HudTextV2.Counter 
            to={value} 
            duration={1500}
            suffix={unit}
          />
        </div>
      </div>
    </HudCard>
  )
}
