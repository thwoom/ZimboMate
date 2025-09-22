import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Badge
} from '../ui'
import {
  Plus,
  Search,
  Heart,
  Skull,
  Shield,
  Star,
  Trash2,
  Sword,
  Users,
  Zap
} from 'lucide-react'
import { useMonsterStore } from '../../stores/monsterStore'
import { useCombatStore } from '../../stores/combatStore'
import { MonsterTemplate, QuickMonster, MonsterOrigin, MonsterTag } from '../../models/Monster'

interface MonsterManagerProps {
  onAddToCombat?: (monster: MonsterTemplate | QuickMonster) => void
  showCombatIntegration?: boolean
}

export const MonsterManager: React.FC<MonsterManagerProps> = ({
  onAddToCombat,
  showCombatIntegration = true
}) => {
  const {
    getAllTemplates,
    getFavoriteTemplates,
    quickMonsters,
    favorites,
    toggleFavorite,
    searchTemplates,
    addToCombat,
    createQuickMonster,
    deleteQuickMonster
  } = useMonsterStore()

  const { addParticipant, currentEncounter } = useCombatStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrigin, setSelectedOrigin] = useState<MonsterOrigin | ''>('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [activeTab, setActiveTab] = useState<'templates' | 'quick' | 'create'>('templates')

  const filteredMonsters = useMemo(() => {
    let monsters = showFavoritesOnly ? getFavoriteTemplates() : getAllTemplates()
    if (searchQuery || selectedOrigin) {
      monsters = searchTemplates(searchQuery, selectedOrigin || undefined, [])
    }
    return monsters.sort((a, b) => a.name.localeCompare(b.name))
  }, [searchQuery, selectedOrigin, showFavoritesOnly, getAllTemplates, getFavoriteTemplates, searchTemplates])

  return (
    <div className="space-y-6">
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skull size={20} className="text-primary" />
            Monster Manager
          </CardTitle>
          <CardDescription>
            Browse official creatures, create custom monsters, and manage combat encounters
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex gap-2">
        <Button
          variant={activeTab === 'templates' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('templates')}
        >
          <Users size={16} />
          Templates
        </Button>
        <Button
          variant={activeTab === 'quick' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('quick')}
        >
          <Zap size={16} />
          Quick Monsters
        </Button>
        <Button
          variant={activeTab === 'create' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('create')}
        >
          <Plus size={16} />
          Create
        </Button>
      </div>

      {activeTab === 'templates' && (
        <Card variant="glass" padding="md">
          <p>Templates: {filteredMonsters.length} monsters found</p>
          <div className="grid gap-2 mt-4">
            {filteredMonsters.slice(0, 5).map((monster) => (
              <div key={monster.id} className="p-2 bg-background/50 rounded">
                <span className="font-medium">{monster.name}</span> - {monster.hp} HP
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'quick' && (
        <Card variant="glass" padding="md">
          <p>Quick monsters: {quickMonsters.length}</p>
        </Card>
      )}

      {activeTab === 'create' && (
        <Card variant="glass" padding="md">
          <p>Create new monster form will go here</p>
        </Card>
      )}
    </div>
  )
}