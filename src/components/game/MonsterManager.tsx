import type {
  MonsterOrigin,
  MonsterTemplate,
  QuickMonster,
} from '../../models/Monster'
import { Heart, Plus, Search, Skull, Users, Zap } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useCombatStore } from '../../stores/combatStore'
import { useMonsterStore } from '../../stores/monsterStore'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '../ui'

interface MonsterManagerProps {
  onAddToCombat?: (monster: MonsterTemplate | QuickMonster) => void
  showCombatIntegration?: boolean
}

const MAX_TEMPLATES_PREVIEW = 8

export const MonsterManager: React.FC<MonsterManagerProps> = ({
  onAddToCombat,
  showCombatIntegration = true,
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
  } = useMonsterStore()

  const { addParticipant, currentEncounter } = useCombatStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrigin, setSelectedOrigin] = useState<MonsterOrigin | ''>('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const templates = useMemo(() => getAllTemplates(), [getAllTemplates])

  const filteredMonsters = useMemo(() => {
    const base = showFavoritesOnly ? getFavoriteTemplates() : templates
    if (!searchQuery && !selectedOrigin) {
      return base
    }

    const fromSearch = searchTemplates(
      searchQuery,
      selectedOrigin || undefined,
      [],
    )

    if (showFavoritesOnly) {
      const favoriteIds = new Set(favorites)
      return fromSearch.filter((template) => favoriteIds.has(template.id))
    }

    return fromSearch
  }, [
    favorites,
    getFavoriteTemplates,
    searchQuery,
    selectedOrigin,
    showFavoritesOnly,
    templates,
    searchTemplates,
  ])

  const availableOrigins = useMemo(() => {
    const originSet = new Set<MonsterOrigin>()
    templates.forEach((template) => {
      if (template.origin) {
        originSet.add(template.origin)
      }
    })
    return Array.from(originSet).sort()
  }, [templates])

  const handleAddToCombat = (template: MonsterTemplate | QuickMonster) => {
    if (!showCombatIntegration) {
      return
    }

    const participant = addToCombat(template)
    if (participant) {
      addParticipant(participant)
    }
    onAddToCombat?.(template)
  }

  const handleCreateQuickMonster = () => {
    createQuickMonster('Quick Foe', 8, 1, 'd6')
  }

  return (
    <div className='space-y-6'>
      <Card variant='elevated'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Skull size={20} className='text-primary' />
            Monster Manager
          </CardTitle>
          <CardDescription>
            Browse official creatures, spin up quick foes, and drop them into
            the current encounter
          </CardDescription>
        </CardHeader>
      </Card>

      <div className='flex flex-col gap-3'>
        <div className='flex flex-wrap gap-2 items-center'>
          <div className='relative'>
            <Search
              size={14}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder='Search monsters by name, instinct, or description'
              className='pl-9 w-72'
            />
          </div>

          <Button
            variant={showFavoritesOnly ? 'primary' : 'outline'}
            onClick={() => setShowFavoritesOnly((flag) => !flag)}
            className='flex items-center gap-2'
          >
            <Heart
              size={14}
              className={showFavoritesOnly ? 'fill-current' : ''}
            />
            Favorites
          </Button>

          {currentEncounter && (
            <Badge variant='secondary'>
              Encounter: {currentEncounter.name}
            </Badge>
          )}
        </div>

        {availableOrigins.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            <Badge
              variant={selectedOrigin === '' ? 'primary' : 'outline'}
              className='cursor-pointer'
              onClick={() => setSelectedOrigin('')}
            >
              All Origins
            </Badge>
            {availableOrigins.map((origin) => (
              <Badge
                key={origin}
                variant={selectedOrigin === origin ? 'primary' : 'outline'}
                className='cursor-pointer'
                onClick={() => setSelectedOrigin(origin)}
              >
                {origin}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className='flex gap-2'>
        <Button
          variant={filteredMonsters.length > 0 ? 'primary' : 'outline'}
          onClick={() => setSelectedOrigin('')}
        >
          <Users size={16} />
          Templates ({filteredMonsters.length})
        </Button>
        <Button
          variant={quickMonsters.length > 0 ? 'primary' : 'outline'}
          onClick={handleCreateQuickMonster}
        >
          <Zap size={16} />
          Quick Monsters ({quickMonsters.length})
        </Button>
        <Button variant='outline' onClick={() => handleCreateQuickMonster()}>
          <Plus size={16} />
          New Quick Monster
        </Button>
      </div>

      <Card variant='surface'>
        <CardContent className='space-y-4'>
          <header className='flex items-center justify-between'>
            <div>
              <h3 className='text-sm font-semibold'>Matching Templates</h3>
              <p className='text-xs text-muted-foreground'>
                Showing up to {MAX_TEMPLATES_PREVIEW} results sorted
                alphabetically
              </p>
            </div>
            <span className='text-xs text-muted-foreground'>
              {filteredMonsters.length} total
            </span>
          </header>

          <div className='grid gap-3'>
            {filteredMonsters.slice(0, MAX_TEMPLATES_PREVIEW).map((monster) => {
              const isFavorite = favorites.includes(monster.id)
              return (
                <div
                  key={monster.id}
                  className='rounded-lg border border-border/60 bg-background/60 p-4'
                >
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-foreground'>
                          {monster.name}
                        </span>
                        {monster.level && (
                          <Badge variant='secondary'>
                            Level
                            {monster.level}
                          </Badge>
                        )}
                        {monster.origin && (
                          <Badge variant='outline'>{monster.origin}</Badge>
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground mt-1 max-w-xl'>
                        {monster.description}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        size='sm'
                        variant={isFavorite ? 'primary' : 'outline'}
                        onClick={() => toggleFavorite(monster.id)}
                        className='flex items-center gap-1'
                      >
                        <Heart
                          size={14}
                          className={isFavorite ? 'fill-current' : ''}
                        />
                        {isFavorite ? 'Favorited' : 'Favorite'}
                      </Button>
                      {showCombatIntegration && (
                        <Button
                          size='sm'
                          variant='primary'
                          onClick={() => handleAddToCombat(monster)}
                        >
                          Add to Combat
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredMonsters.length === 0 && (
              <div className='rounded-lg border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground'>
                No monsters match the current filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
