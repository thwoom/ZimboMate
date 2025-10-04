/**
 * useGameState Hook for ZimboMate V2
 * Global game state management - time, environment, party resources, and world events
 * Integrates gameStateStore with session and campaign management
 */

import type {
  GameTime,
  GlobalEffect,
  PartyResource,
} from '../stores/gameStateStore'
import { useCallback, useMemo } from 'react'
import { useGameStateStore } from '../stores/gameStateStore'
import { useCampaign } from './useCampaign'
import { useSession } from './useSession'

export interface TimeOfDay {
  hour: number
  minute: number
  period:
    | 'dawn'
    | 'morning'
    | 'midday'
    | 'afternoon'
    | 'dusk'
    | 'evening'
    | 'night'
    | 'midnight'
  description: string
}

export interface Weather {
  condition:
    | 'clear'
    | 'cloudy'
    | 'overcast'
    | 'light_rain'
    | 'heavy_rain'
    | 'storm'
    | 'fog'
    | 'snow'
  temperature:
    | 'freezing'
    | 'cold'
    | 'cool'
    | 'mild'
    | 'warm'
    | 'hot'
    | 'scorching'
  wind: 'calm' | 'light' | 'moderate' | 'strong' | 'gale'
  visibility: 'clear' | 'reduced' | 'poor' | 'zero'
}

export interface Environment {
  location: string
  terrain:
    | 'urban'
    | 'wilderness'
    | 'dungeon'
    | 'underground'
    | 'water'
    | 'air'
    | 'planar'
  lighting: 'bright' | 'dim' | 'dark' | 'magical'
  hazards: string[]
  features: string[]
}

export interface UseGameStateReturn {
  // Time management
  gameTime: GameTime
  timeOfDay: TimeOfDay
  advanceTime: (amount: number, unit: 'minutes' | 'hours' | 'days') => void
  setTime: (hour: number, minute: number, day: number) => void

  // Weather and environment
  weather: Weather
  environment: Environment
  updateWeather: (weather: Partial<Weather>) => void
  updateEnvironment: (environment: Partial<Environment>) => void

  // Global effects
  globalEffects: GlobalEffect[]
  addGlobalEffect: (effect: Omit<GlobalEffect, 'id'>) => void
  removeGlobalEffect: (effectId: string) => void
  updateGlobalEffect: (effectId: string, updates: Partial<GlobalEffect>) => void
  getActiveGlobalEffects: () => GlobalEffect[]

  // Party resources
  partyResources: PartyResource[]
  updatePartyResource: (resourceId: string, amount: number) => void
  addPartyResource: (resource: Omit<PartyResource, 'id'>) => void
  removePartyResource: (resourceId: string) => void

  // World events
  triggerWorldEvent: (
    eventType: string,
    description: string,
    effects?: any[],
  ) => void
  getRecentWorldEvents: () => Array<{
    id: string
    type: string
    description: string
    timestamp: Date
    effects: any[]
  }>

  // Quick actions
  shortRest: () => void
  longRest: () => void
  advanceDay: () => void
  changeLocation: (location: string, terrain?: Environment['terrain']) => void

  // State queries
  isDay: boolean
  isNight: boolean
  canSeeStars: boolean
  needsLight: boolean

  // Utility
  isLoading: boolean
  error: string | null
}

/**
 * Hook for managing global game state
 */
export function useGameState(): UseGameStateReturn {
  const {
    gameTime,
    environment,
    globalEffects,
    partyResources,
    worldEvents,
    updateGameTime,
    updateWeather: storeUpdateWeather,
    updateEnvironment: storeUpdateEnvironment,
    addGlobalEffect: storeAddGlobalEffect,
    removeGlobalEffect: storeRemoveGlobalEffect,
    updateGlobalEffect: storeUpdateGlobalEffect,
    updatePartyResource: storeUpdatePartyResource,
    addPartyResource: storeAddPartyResource,
    removePartyResource: storeRemovePartyResource,
    addWorldEvent,
    isLoading,
    error,
  } = useGameStateStore()

  const { advanceTime: sessionAdvanceTime } = useSession()
  const { currentCampaign: _currentCampaign } = useCampaign()

  // Time of day calculation
  const timeOfDay = useMemo((): TimeOfDay => {
    const hour = gameTime.hour
    const minute = gameTime.minute

    let period: TimeOfDay['period']
    let description: string

    if (hour >= 5 && hour < 7) {
      period = 'dawn'
      description = 'The sun rises, painting the sky in soft colors'
    } else if (hour >= 7 && hour < 12) {
      period = 'morning'
      description = 'The morning sun climbs higher in the sky'
    } else if (hour >= 12 && hour < 13) {
      period = 'midday'
      description = 'The sun reaches its zenith overhead'
    } else if (hour >= 13 && hour < 17) {
      period = 'afternoon'
      description = 'The afternoon sun begins its descent'
    } else if (hour >= 17 && hour < 19) {
      period = 'dusk'
      description = 'The sun sets, casting long shadows'
    } else if (hour >= 19 && hour < 22) {
      period = 'evening'
      description = 'Twilight settles over the land'
    } else if (hour >= 22 || hour < 1) {
      period = 'night'
      description = 'Night has fallen, stars twinkle above'
    } else {
      period = 'midnight'
      description = 'The deepest part of night, when shadows reign'
    }

    return { hour, minute, period, description }
  }, [gameTime])

  // State queries
  const isDay = useMemo(() => {
    const hour = gameTime.hour
    return hour >= 6 && hour < 18
  }, [gameTime.hour])

  const isNight = useMemo(() => !isDay, [isDay])

  // Derive weather object from environment (store shape uses environment.weather as string)
  const weather: Weather = useMemo(() => {
    const rawCondition = (environment as any)?.weather ?? 'clear'
    const normalized = String(rawCondition)
      .toLowerCase()
      .replace(/\s+/g, '_') as Weather['condition']
    const validConditions: ReadonlyArray<Weather['condition']> = [
      'clear',
      'cloudy',
      'overcast',
      'light_rain',
      'heavy_rain',
      'storm',
      'fog',
      'snow',
    ]
    const condition = (validConditions as readonly string[]).includes(
      normalized,
    )
      ? (normalized as Weather['condition'])
      : 'clear'

    const temp = ((environment as any)?.temperature ??
      'mild') as Weather['temperature']

    return {
      condition,
      temperature: temp,
      wind: 'calm',
      visibility: 'clear',
    }
  }, [environment])

  const canSeeStars = useMemo(() => {
    return (
      isNight &&
      weather.condition !== 'overcast' &&
      weather.condition !== 'storm'
    )
  }, [isNight, weather.condition])

  const needsLight = useMemo(() => {
    return (
      (isNight || environment.lighting === 'dark') &&
      environment.lighting !== 'magical'
    )
  }, [isNight, environment.lighting])

  // Time management
  const advanceTime = useCallback(
    (amount: number, unit: 'minutes' | 'hours' | 'days') => {
      let totalMinutes = 0

      switch (unit) {
        case 'minutes':
          totalMinutes = amount
          break
        case 'hours':
          totalMinutes = amount * 60
          break
        case 'days':
          totalMinutes = amount * 24 * 60
          break
      }

      const newMinute = (gameTime.minute + totalMinutes) % 60
      const newHour =
        (gameTime.hour + Math.floor((gameTime.minute + totalMinutes) / 60)) % 24
      const newDay =
        gameTime.day +
        Math.floor(
          (gameTime.hour * 60 + gameTime.minute + totalMinutes) / (24 * 60),
        )

      updateGameTime({
        minute: newMinute,
        hour: newHour,
        day: newDay,
      })

      // Advance session time as well
      sessionAdvanceTime('turn')
    },
    [gameTime, updateGameTime, sessionAdvanceTime],
  )

  const setTime = useCallback(
    (hour: number, minute: number, day: number) => {
      updateGameTime({ hour, minute, day })
    },
    [updateGameTime],
  )

  // Weather and environment
  const updateWeather = useCallback(
    (weatherUpdates: Partial<Weather>) => {
      storeUpdateWeather(weatherUpdates)
    },
    [storeUpdateWeather],
  )

  const updateEnvironment = useCallback(
    (environmentUpdates: Partial<Environment>) => {
      storeUpdateEnvironment(environmentUpdates)
    },
    [storeUpdateEnvironment],
  )

  // Global effects
  const addGlobalEffect = useCallback(
    (effect: Omit<GlobalEffect, 'id'>) => {
      storeAddGlobalEffect(effect)
    },
    [storeAddGlobalEffect],
  )

  const removeGlobalEffect = useCallback(
    (effectId: string) => {
      storeRemoveGlobalEffect(effectId)
    },
    [storeRemoveGlobalEffect],
  )

  const updateGlobalEffect = useCallback(
    (effectId: string, updates: Partial<GlobalEffect>) => {
      storeUpdateGlobalEffect(effectId, updates)
    },
    [storeUpdateGlobalEffect],
  )

  const getActiveGlobalEffects = useCallback(() => {
    return globalEffects.filter((effect) => {
      if (effect.duration === 'permanent') return true
      if (typeof effect.duration === 'number') return effect.duration > 0
      return true // Scene/encounter effects are active until removed
    })
  }, [globalEffects])

  // Party resources
  const updatePartyResource = useCallback(
    (resourceId: string, amount: number) => {
      storeUpdatePartyResource(resourceId, amount)
    },
    [storeUpdatePartyResource],
  )

  const addPartyResource = useCallback(
    (resource: Omit<PartyResource, 'id'>) => {
      storeAddPartyResource(resource)
    },
    [storeAddPartyResource],
  )

  const removePartyResource = useCallback(
    (resourceId: string) => {
      storeRemovePartyResource(resourceId)
    },
    [storeRemovePartyResource],
  )

  // World events
  const triggerWorldEvent = useCallback(
    (eventType: string, description: string, effects: any[] = []) => {
      addWorldEvent({
        type: eventType,
        description,
        effects,
      })
    },
    [addWorldEvent],
  )

  const getRecentWorldEvents = useCallback(() => {
    return worldEvents
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 10)
  }, [worldEvents])

  // Quick actions
  const shortRest = useCallback(() => {
    // Advance time by 1 hour
    advanceTime(1, 'hours')

    // Trigger short rest effects
    triggerWorldEvent('short_rest', 'The party takes a short rest', [
      { type: 'heal', amount: 'partial' },
      { type: 'refresh', resources: ['short_rest'] },
    ])
  }, [advanceTime, triggerWorldEvent])

  const longRest = useCallback(() => {
    // Advance time by 8 hours
    advanceTime(8, 'hours')

    // Trigger long rest effects
    triggerWorldEvent('long_rest', 'The party takes a long rest', [
      { type: 'heal', amount: 'full' },
      { type: 'refresh', resources: ['all'] },
      { type: 'clear', effects: ['temporary'] },
    ])

    // Clear temporary global effects
    const temporaryEffects = globalEffects.filter(
      (effect) =>
        effect.duration !== 'permanent' && typeof effect.duration !== 'number',
    )
    temporaryEffects.forEach((effect) => removeGlobalEffect(effect.id))
  }, [advanceTime, triggerWorldEvent, globalEffects, removeGlobalEffect])

  const advanceDay = useCallback(() => {
    advanceTime(1, 'days')
    triggerWorldEvent('new_day', 'A new day begins', [])
  }, [advanceTime, triggerWorldEvent])

  const changeLocation = useCallback(
    (location: string, terrain: Environment['terrain'] = 'wilderness') => {
      updateEnvironment({ location, terrain })
      triggerWorldEvent('location_change', `The party arrives at ${location}`, [
        { type: 'location', name: location, terrain },
      ])
    },
    [updateEnvironment, triggerWorldEvent],
  )

  return {
    // Time management
    gameTime,
    timeOfDay,
    advanceTime,
    setTime,

    // Weather and environment
    weather,
    environment,
    updateWeather,
    updateEnvironment,

    // Global effects
    globalEffects,
    addGlobalEffect,
    removeGlobalEffect,
    updateGlobalEffect,
    getActiveGlobalEffects,

    // Party resources
    partyResources,
    updatePartyResource,
    addPartyResource,
    removePartyResource,

    // World events
    triggerWorldEvent,
    getRecentWorldEvents,

    // Quick actions
    shortRest,
    longRest,
    advanceDay,
    changeLocation,

    // State queries
    isDay,
    isNight,
    canSeeStars,
    needsLight,

    // Utility
    isLoading,
    error,
  }
}

/**
 * Simplified game state hook for basic time and environment queries
 */
export function useSimpleGameState() {
  const {
    timeOfDay,
    weather,
    environment,
    isDay,
    isNight,
    needsLight,
    advanceTime,
    shortRest,
    longRest,
  } = useGameState()

  return {
    time: timeOfDay,
    weather,
    location: environment.location,
    isDay,
    isNight,
    needsLight,
    advanceTime,
    shortRest,
    longRest,
  }
}
