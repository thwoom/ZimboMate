import * as THREE from 'three'
/**
 * Audio Service for ZimboMate V2
 * 3D Spatial Audio System with Howler.js integration
 * Handles dice sounds, ambient audio, and magical effects
 */

import { logger } from '../utils/logger'

// Audio configuration types
export interface AudioConfig {
  masterVolume: number
  sfxVolume: number
  musicVolume: number
  ambientVolume: number
  enabled: boolean
  spatialAudio: boolean
  theme: 'fantasy' | 'sci-fi' | 'dark' | 'light'
}

export interface SoundEffect {
  id: string
  url: string
  volume: number
  loop: boolean
  spatial: boolean
  category: 'sfx' | 'music' | 'ambient' | 'ui'
}

export interface SpatialSound {
  id: string
  position: THREE.Vector3
  volume: number
  maxDistance: number
  rolloffFactor: number
}

// Audio events for dice system
export type DiceAudioEvent =
  | 'roll_start'
  | 'dice_collision'
  | 'dice_settle'
  | 'outcome_success'
  | 'outcome_partial'
  | 'outcome_failure'
  | 'magical_effect'

export interface DiceAudioData {
  event: DiceAudioEvent
  intensity?: number
  position?: THREE.Vector3
  material?: string
  outcome?: 'success' | 'partial' | 'failure'
  force?: number
}

/**
 * Enhanced Audio Service with 3D spatial audio capabilities
 */
export class AudioService {
  private config: AudioConfig
  private sounds: Map<string, any> = new Map() // Would be Howl instances in real implementation
  private spatialSounds: Map<string, SpatialSound> = new Map()
  private listener: THREE.AudioListener | null = null
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private categoryGains: Map<string, GainNode> = new Map()

  // Theme-based sound libraries
  private soundLibraries = {
    fantasy: {
      dice_roll: '/audio/fantasy/dice-roll-wooden.mp3',
      dice_collision_felt: '/audio/fantasy/dice-felt-soft.mp3',
      dice_collision_wood: '/audio/fantasy/dice-wood-tap.mp3',
      dice_collision_stone: '/audio/fantasy/dice-stone-click.mp3',
      dice_settle_ivory: '/audio/fantasy/dice-settle-soft.mp3',
      dice_settle_wood: '/audio/fantasy/dice-settle-wood.mp3',
      outcome_success: '/audio/fantasy/success-chime.mp3',
      outcome_partial: '/audio/fantasy/partial-bell.mp3',
      outcome_failure: '/audio/fantasy/failure-drum.mp3',
      magical_sparkle: '/audio/fantasy/magical-sparkle.mp3',
      ambient_tavern: '/audio/fantasy/ambient-tavern.mp3',
      ambient_dungeon: '/audio/fantasy/ambient-dungeon.mp3',
    },
    'sci-fi': {
      dice_roll: '/audio/sci-fi/dice-roll-digital.mp3',
      dice_collision_felt: '/audio/sci-fi/dice-synthetic-soft.mp3',
      dice_collision_metal: '/audio/sci-fi/dice-metal-ping.mp3',
      dice_settle_crystal: '/audio/sci-fi/dice-settle-crystal.mp3',
      dice_settle_metal: '/audio/sci-fi/dice-settle-metal.mp3',
      outcome_success: '/audio/sci-fi/success-synth.mp3',
      outcome_partial: '/audio/sci-fi/partial-beep.mp3',
      outcome_failure: '/audio/sci-fi/failure-buzz.mp3',
      magical_effect: '/audio/sci-fi/tech-effect.mp3',
      ambient_space: '/audio/sci-fi/ambient-space.mp3',
      ambient_lab: '/audio/sci-fi/ambient-lab.mp3',
    },
    dark: {
      dice_roll: '/audio/dark/dice-roll-ominous.mp3',
      dice_collision_stone: '/audio/dark/dice-stone-echo.mp3',
      dice_settle_obsidian: '/audio/dark/dice-settle-dark.mp3',
      outcome_success: '/audio/dark/success-whisper.mp3',
      outcome_partial: '/audio/dark/partial-wind.mp3',
      outcome_failure: '/audio/dark/failure-thunder.mp3',
      magical_effect: '/audio/dark/dark-magic.mp3',
      ambient_crypt: '/audio/dark/ambient-crypt.mp3',
    },
    light: {
      dice_roll: '/audio/light/dice-roll-bright.mp3',
      dice_collision_felt: '/audio/light/dice-felt-gentle.mp3',
      dice_settle_ivory: '/audio/light/dice-settle-light.mp3',
      outcome_success: '/audio/light/success-harmony.mp3',
      outcome_partial: '/audio/light/partial-chime.mp3',
      outcome_failure: '/audio/light/failure-sigh.mp3',
      magical_effect: '/audio/light/light-magic.mp3',
      ambient_peaceful: '/audio/light/ambient-peaceful.mp3',
    },
  }

  constructor(initialConfig: Partial<AudioConfig> = {}) {
    this.config = {
      masterVolume: 0.7,
      sfxVolume: 0.8,
      musicVolume: 0.6,
      ambientVolume: 0.4,
      enabled: true,
      spatialAudio: true,
      theme: 'fantasy',
      ...initialConfig,
    }

    this.initializeAudioContext()
    this.preloadSounds()
  }

  /**
   * Initialize Web Audio API context and gain nodes
   */
  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()

      // Create master gain node
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = this.config.masterVolume

      // Create category gain nodes
      const categories = ['sfx', 'music', 'ambient', 'ui']
      categories.forEach((category) => {
        const gainNode = this.audioContext!.createGain()
        gainNode.connect(this.masterGain!)
        gainNode.gain.value =
          (this.config[`${category}Volume` as keyof AudioConfig] as number) || 1
        this.categoryGains.set(category, gainNode)
      })
    } catch (error) {
      logger.warn('AudioService: Failed to initialize audio context', error)
      this.config.enabled = false
    }
  }

  /**
   * Preload theme-appropriate sounds
   */
  private preloadSounds(): void {
    if (!this.config.enabled) return

    const themeLibrary = this.soundLibraries[this.config.theme]

    Object.entries(themeLibrary).forEach(([key, url]) => {
      // In a real implementation, this would create Howl instances
      // For now, we'll simulate with a simple structure
      this.sounds.set(key, {
        url,
        loaded: false,
        volume: 1,
        spatial: key.includes('dice') || key.includes('outcome'),
        category: this.getSoundCategory(key),
      })
    })
  }

  /**
   * Get sound category for volume control
   */
  private getSoundCategory(soundKey: string): string {
    if (soundKey.includes('ambient')) return 'ambient'
    if (soundKey.includes('outcome') || soundKey.includes('magical'))
      return 'ui'
    if (soundKey.includes('dice')) return 'sfx'
    return 'sfx'
  }

  /**
   * Set 3D audio listener (usually attached to camera)
   */
  setListener(listener: THREE.AudioListener): void {
    this.listener = listener
  }

  /**
   * Update listener position and orientation
   */
  updateListener(
    position: THREE.Vector3,
    forward: THREE.Vector3,
    up: THREE.Vector3,
  ): void {
    if (!this.listener || !this.config.spatialAudio) return

    this.listener.position.copy(position)

    const positionClone = position.clone()
    const forwardDir = forward.clone().normalize()
    const upDir = up.clone().normalize()
    const target = positionClone.clone().add(forwardDir)
    const orientation = new THREE.Matrix4().lookAt(positionClone, target, upDir)

    this.listener.quaternion.setFromRotationMatrix(orientation)
    this.listener.updateMatrixWorld()
  }

  /**
   * Play dice-related audio with 3D positioning
   */
  playDiceAudio(data: DiceAudioData): void {
    if (!this.config.enabled) return

    const soundKey = this.getDiceSoundKey(data)
    const sound = this.sounds.get(soundKey)

    if (!sound) {
      logger.warn(`AudioService: Sound not found: ${soundKey}`)
      return
    }

    const volume = this.calculateVolume(data)

    if (data.position && this.config.spatialAudio) {
      this.playSpatialSound(soundKey, data.position, volume)
    } else {
      this.playSound(soundKey, volume)
    }
  }

  /**
   * Get appropriate sound key for dice event
   */
  private getDiceSoundKey(data: DiceAudioData): string {
    switch (data.event) {
      case 'roll_start':
        return 'dice_roll'

      case 'dice_collision': {
        const material = data.material || 'felt'
        return `dice_collision_${material}`
      }
      case 'dice_settle': {
        const settleMaterial = data.material || 'ivory'
        return `dice_settle_${settleMaterial}`
      }

      case 'outcome_success':
      case 'outcome_partial':
      case 'outcome_failure':
        return data.event

      case 'magical_effect':
        return this.config.theme === 'sci-fi'
          ? 'magical_effect'
          : 'magical_sparkle'

      default:
        return 'dice_roll'
    }
  }

  /**
   * Calculate volume based on event data
   */
  private calculateVolume(data: DiceAudioData): number {
    let baseVolume = 1

    // Adjust volume based on intensity/force
    if (data.intensity !== undefined) {
      baseVolume = Math.min(data.intensity / 10, 1)
    } else if (data.force !== undefined) {
      baseVolume = Math.min(data.force / 20, 1)
    }

    // Boost outcome sounds
    if (data.event.includes('outcome')) {
      baseVolume *= 1.2
    }

    return Math.max(0.1, Math.min(1, baseVolume))
  }

  /**
   * Play sound with 3D spatial positioning
   */
  private playSpatialSound(
    soundKey: string,
    position: THREE.Vector3,
    volume: number,
  ): void {
    const sound = this.sounds.get(soundKey)
    if (!sound || !this.audioContext || !this.listener) return

    // In a real implementation with Howler.js:
    // const howl = new Howl({
    //   src: [sound.url],
    //   volume: volume * this.config.sfxVolume,
    //   html5: true,
    //   onload: () => {
    //     howl.pos(position.x, position.y, position.z)
    //     howl.play()
    //   }
    // })

    // For now, simulate with regular audio
    this.playSound(
      soundKey,
      volume * this.calculateDistanceAttenuation(position),
    )
  }

  /**
   * Calculate distance-based volume attenuation
   */
  private calculateDistanceAttenuation(position: THREE.Vector3): number {
    if (!this.listener) return 1

    const distance = this.listener.position.distanceTo(position)
    const maxDistance = 20
    const rolloffFactor = 2

    if (distance < 1) return 1
    if (distance > maxDistance) return 0

    return (1 - distance / maxDistance) ** rolloffFactor
  }

  /**
   * Play regular (non-spatial) sound
   */
  private playSound(soundKey: string, volume: number): void {
    const sound = this.sounds.get(soundKey)
    if (!sound) return

    try {
      // Simple audio implementation for demonstration
      const audio = new Audio(sound.url)
      const category = sound.category
      const categoryVolume =
        (this.config[`${category}Volume` as keyof AudioConfig] as number) || 1

      audio.volume = volume * categoryVolume * this.config.masterVolume
      audio.play().catch(() => {
        // Silently handle autoplay restrictions
      })
    } catch (error) {
      logger.warn(`AudioService: Failed to play sound ${soundKey}`, error)
    }
  }

  /**
   * Play ambient background audio
   */
  playAmbient(ambientKey?: string): void {
    if (!this.config.enabled) return

    const key = ambientKey || this.getDefaultAmbient()
    const sound = this.sounds.get(key)

    if (sound) {
      // In a real implementation, this would loop the ambient sound
      this.playSound(key, 1)
    }
  }

  /**
   * Get default ambient sound for current theme
   */
  private getDefaultAmbient(): string {
    switch (this.config.theme) {
      case 'fantasy':
        return 'ambient_tavern'
      case 'sci-fi':
        return 'ambient_space'
      case 'dark':
        return 'ambient_crypt'
      case 'light':
        return 'ambient_peaceful'
      default:
        return 'ambient_tavern'
    }
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    // In a real implementation, this would stop all Howl instances
    this.spatialSounds.clear()
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AudioConfig>): void {
    const oldTheme = this.config.theme
    this.config = { ...this.config, ...newConfig }

    // Update gain node volumes
    if (this.masterGain) {
      this.masterGain.gain.value = this.config.masterVolume
    }

    this.categoryGains.forEach((gainNode, category) => {
      const volumeKey = `${category}Volume` as keyof AudioConfig
      gainNode.gain.value = (this.config[volumeKey] as number) || 1
    })

    // Reload sounds if theme changed
    if (oldTheme !== this.config.theme) {
      this.sounds.clear()
      this.preloadSounds()
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AudioConfig {
    return { ...this.config }
  }

  /**
   * Test audio system with sample sounds
   */
  testAudio(): void {
    if (!this.config.enabled) {
      logger.warn('AudioService: Audio is disabled')
      return
    }

    logger.info('AudioService: Testing audio system...')

    // Test dice roll
    setTimeout(() => {
      this.playDiceAudio({
        event: 'roll_start',
        force: 15,
      })
    }, 100)

    // Test collision
    setTimeout(() => {
      this.playDiceAudio({
        event: 'dice_collision',
        intensity: 8,
        material: 'felt',
        position: new THREE.Vector3(0, 0, 0),
      })
    }, 1000)

    // Test settle
    setTimeout(() => {
      this.playDiceAudio({
        event: 'dice_settle',
        material: 'ivory',
      })
    }, 2000)

    // Test outcome
    setTimeout(() => {
      this.playDiceAudio({
        event: 'outcome_success',
      })
    }, 3000)
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopAll()
    this.sounds.clear()
    this.spatialSounds.clear()

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
  }
}

// Global audio service instance
export const audioService = new AudioService()

// Convenience functions for dice audio
export function playDiceRoll(force: number, position?: THREE.Vector3) {
  audioService.playDiceAudio({
    event: 'roll_start',
    force,
    position,
  })
}

export function playDiceCollision(
  intensity: number,
  position: THREE.Vector3,
  material = 'felt',
) {
  audioService.playDiceAudio({
    event: 'dice_collision',
    intensity,
    position,
    material,
  })
}

export function playDiceSettle(material = 'ivory', position?: THREE.Vector3) {
  audioService.playDiceAudio({
    event: 'dice_settle',
    material,
    position,
  })
}

export function playOutcome(outcome: 'success' | 'partial' | 'failure') {
  audioService.playDiceAudio({
    event: `outcome_${outcome}` as DiceAudioEvent,
    outcome,
  })
}

export function playMagicalEffect(position?: THREE.Vector3) {
  audioService.playDiceAudio({
    event: 'magical_effect',
    position,
  })
}
