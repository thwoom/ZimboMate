/**
 * Chronicle System Demo
 *
 * Demonstrates the complete contextual Chronicle system integration
 * with dice rolling, equipment usage, and smart story prompts.
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, Button } from '../ui'
import { ChronicleProvider, useChronicle } from './ChronicleProvider'
import { StatRoller } from '../game/StatRoller'
import { ChronicleEnabledDiceRoller } from '../game/ChronicleEnabledDiceRoller'
import { ChronicleEnabledEquipmentPanel } from '../game/ChronicleEnabledEquipmentPanel'
import {
  BookOpen,
  Dice6,
  Sword,
  Settings,
  ToggleLeft,
  ToggleRight,
  Info,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import type { Character } from '../../models/Character'

// Mock character for demo
const demoCharacter: Character = {
  id: 'demo-character',
  name: 'Thorin Stormwind',
  attributes: {
    STR: 15,
    DEX: 13,
    CON: 14,
    INT: 12,
    WIS: 16,
    CHA: 11
  },
  hitPoints: { max: 22, current: 22 },
  load: { max: 15, current: 8 },
  armor: 2,
  level: 3,
  xp: 12,
  inventory: [
    {
      id: 'sword-1',
      name: 'Gleaming Longsword',
      description: 'A well-crafted blade that catches the light',
      category: 'weapon',
      weight: 2,
      equipped: true,
      tags: ['close', 'forceful', '+1'],
      damage: '1d8+1'
    },
    {
      id: 'potion-1',
      name: 'Healing Potion',
      description: 'A bubbling red liquid that smells of mint',
      category: 'consumable',
      weight: 0,
      equipped: false,
      uses: 3
    },
    {
      id: 'rope-1',
      name: 'Silk Rope',
      description: '50 feet of strong, lightweight rope',
      category: 'adventuring-gear',
      weight: 1,
      equipped: false
    }
  ]
}

const DemoSection: React.FC<{
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}> = ({ title, description, icon, children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`space-y-4 ${className}`}
  >
    <Card variant="magical">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  </motion.div>
)

const ChronicleControls: React.FC = () => {
  const {
    isOverlayEnabled,
    toggleOverlay,
    overlayPosition,
    setOverlayPosition,
    maxPrompts,
    setMaxPrompts
  } = useChronicle()

  return (
    <DemoSection
      title="Chronicle System Controls"
      description="Configure how the Chronicle system behaves"
      icon={<Settings size={20} className="text-blue-600" />}
    >
      <div className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <div className="font-medium">Chronicle Prompts</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Show contextual story prompts after actions
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => toggleOverlay()}
            className="p-2"
          >
            {isOverlayEnabled ? (
              <ToggleRight size={24} className="text-green-600" />
            ) : (
              <ToggleLeft size={24} className="text-gray-400" />
            )}
          </Button>
        </div>

        {/* Position Control */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Overlay Position</label>
          <div className="grid grid-cols-2 gap-2">
            {['top-right', 'top-left', 'bottom-right', 'bottom-left'].map(position => (
              <Button
                key={position}
                variant={overlayPosition === position ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setOverlayPosition(position as any)}
                className="text-xs"
              >
                {position.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Max Prompts Control */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Max Simultaneous Prompts</label>
          <div className="flex gap-2">
            {[1, 2, 3].map(num => (
              <Button
                key={num}
                variant={maxPrompts === num ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setMaxPrompts(num)}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </DemoSection>
  )
}

const DemoContent: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'dice' | 'stats' | 'equipment'>('dice')
  const { promptForChronicle } = useChronicle()

  const handleManualPrompt = () => {
    promptForChronicle(
      'The party reaches a crucial decision point in their adventure',
      'session_milestone',
      demoCharacter.name
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-blue-200 dark:border-blue-800"
          >
            <BookOpen size={24} className="text-blue-600" />
            <h1 className="text-2xl font-display font-bold">Chronicle System Demo</h1>
            <Sparkles size={20} className="text-yellow-500" />
          </motion.div>

          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Experience the contextual Chronicle system in action. Roll dice, use equipment,
            and see how the system intelligently prompts you to build your adventure's story.
          </p>
        </div>

        {/* Demo Navigation */}
        <div className="flex justify-center gap-2">
          {[
            { id: 'dice', label: 'Dice Rolling', icon: Dice6 },
            { id: 'stats', label: 'Stat Tests', icon: Sparkles },
            { id: 'equipment', label: 'Equipment', icon: Sword }
          ].map(demo => {
            const Icon = demo.icon
            return (
              <Button
                key={demo.id}
                variant={activeDemo === demo.id ? 'primary' : 'outline'}
                onClick={() => setActiveDemo(demo.id as any)}
                className="flex items-center gap-2"
              >
                <Icon size={16} />
                {demo.label}
              </Button>
            )
          })}
        </div>

        {/* Demo Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Interactive Demo */}
          <div className="space-y-6">
            {activeDemo === 'dice' && (
              <DemoSection
                title="Basic Dice Rolling"
                description="Try rolling 2d6 and see Chronicle prompts appear"
                icon={<Dice6 size={20} className="text-green-600" />}
              >
                <ChronicleEnabledDiceRoller
                  characterName={demoCharacter.name}
                  modifier={2}
                />
              </DemoSection>
            )}

            {activeDemo === 'stats' && (
              <DemoSection
                title="Attribute Testing"
                description="Roll specific stats and get contextual prompts like 'Why did you roll DEX?'"
                icon={<Sparkles size={20} className="text-purple-600" />}
              >
                <StatRoller
                  characterName={demoCharacter.name}
                  statModifiers={{
                    STR: 2,
                    DEX: 1,
                    CON: 2,
                    INT: 0,
                    WIS: 3,
                    CHA: 0
                  }}
                />
              </DemoSection>
            )}

            {activeDemo === 'equipment' && (
              <DemoSection
                title="Equipment Usage"
                description="Use items and get prompts to chronicle the moment"
                icon={<Sword size={20} className="text-red-600" />}
              >
                <ChronicleEnabledEquipmentPanel
                  character={demoCharacter}
                />
              </DemoSection>
            )}
          </div>

          {/* Right Column - Controls and Info */}
          <div className="space-y-6">
            <ChronicleControls />

            <DemoSection
              title="Manual Chronicle Prompt"
              description="Test the system with a manual prompt"
              icon={<Info size={20} className="text-orange-600" />}
            >
              <Button
                onClick={handleManualPrompt}
                className="w-full flex items-center gap-2"
                variant="outline"
              >
                <BookOpen size={16} />
                Trigger Test Prompt
                <ArrowRight size={16} />
              </Button>
            </DemoSection>

            <DemoSection
              title="How It Works"
              description="The Chronicle system in action"
              icon={<Sparkles size={20} className="text-pink-600" />}
            >
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300 flex-shrink-0">1</div>
                  <div>
                    <div className="font-medium">Action Detection</div>
                    <div className="text-gray-600 dark:text-gray-400">System watches for dice rolls, equipment use, etc.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-300 flex-shrink-0">2</div>
                  <div>
                    <div className="font-medium">Context Analysis</div>
                    <div className="text-gray-600 dark:text-gray-400">AI analyzes game state and recent actions</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300 flex-shrink-0">3</div>
                  <div>
                    <div className="font-medium">Smart Prompts</div>
                    <div className="text-gray-600 dark:text-gray-400">Contextual templates generate story suggestions</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-xs font-bold text-orange-700 dark:text-orange-300 flex-shrink-0">4</div>
                  <div>
                    <div className="font-medium">Story Building</div>
                    <div className="text-gray-600 dark:text-gray-400">Your choices build the adventure chronicle</div>
                  </div>
                </div>
              </div>
            </DemoSection>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ChronicleSystemDemo: React.FC = () => {
  return (
    <ChronicleProvider defaultEnabled={true}>
      <DemoContent />
    </ChronicleProvider>
  )
}