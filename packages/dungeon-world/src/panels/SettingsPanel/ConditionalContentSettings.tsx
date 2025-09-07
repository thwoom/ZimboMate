import React from 'react'
import { createPanel } from '../../framework/Panel'
import { useGameStore } from '../../store/GameStore'
import './ConditionalContentSettings.css'
import { HUDFrame } from '../../components/ui/HUDFrame'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Switch } from '../../components/ui/switch'
import { motion, useReducedMotion } from 'framer-motion'
import { staggerContainer, itemFadeIn, getVariant } from '../../utils/motion'

const ConditionalContentSettings: React.FC = () => {
  const { state, updateSettings } = useGameStore()
  const cc = state.settings.conditionalContent!
  const prefersReduced = useReducedMotion()
  return (
    <motion.div initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'} variants={getVariant('fade')}>
      <HUDFrame className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Conditional Content</CardTitle>
          </CardHeader>
          <CardContent>
          <motion.div className="space-y-3" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
            <motion.label className="flex items-center gap-2" variants={itemFadeIn}>
              <Switch checked={cc.global.preferClassRelevant} onCheckedChange={(v) => updateSettings({ conditionalContent: { ...cc, global: { ...cc.global, preferClassRelevant: !!v } } })} />
              <span>Prefer class-relevant content</span>
            </motion.label>
            <motion.label className="flex items-center gap-2" variants={itemFadeIn}>
              <Switch checked={cc.global.showAllMoves} onCheckedChange={(v) => updateSettings({ conditionalContent: { ...cc, global: { ...cc.global, showAllMoves: !!v } } })} />
              <span>Show all moves</span>
            </motion.label>
            <motion.label className="flex items-center gap-2" variants={itemFadeIn}>
              <Switch checked={cc.global.showAllEquipment} onCheckedChange={(v) => updateSettings({ conditionalContent: { ...cc, global: { ...cc.global, showAllEquipment: !!v } } })} />
              <span>Show all equipment</span>
            </motion.label>
            <motion.label className="flex items-center gap-2" variants={itemFadeIn}>
              <Switch checked={cc.global.showSpellsForNonCasters} onCheckedChange={(v) => updateSettings({ conditionalContent: { ...cc, global: { ...cc.global, showSpellsForNonCasters: !!v } } })} />
              <span>Show spells for non-casters</span>
            </motion.label>
          </motion.div>
          </CardContent>
        </Card>
      </HUDFrame>
    </motion.div>
  )
}

export default createPanel(
  {
    id: 'settings-conditional',
    name: 'Conditional Content',
    icon: '⚙️',
    priority: 10,
  },
  ConditionalContentSettings,
)


