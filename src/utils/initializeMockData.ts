/**
 * Initialize mock data for development and demo purposes
 * This file sets up sample characters, campaigns, and other data
 */

import { useCharacterStore } from '../stores/characterStore'

// Initialize mock data when the module is imported
function initializeMockData() {
  // Only initialize in development mode
  if (!import.meta.env.DEV) {
    return
  }

  // Check if we already have data
  const existingCharacters = useCharacterStore.getState().characters
  if (existingCharacters.length > 0) {
    return // Already initialized
  }

  // Create sample characters
  const sampleCharacters = [
    {
      name: 'Eldara Moonwhisper',
      class: 'Wizard',
      level: 5,
      race: 'Elf',
      alignment: 'Good',
      attributes: {
        STR: 12,
        DEX: 14,
        CON: 13,
        INT: 18,
        WIS: 16,
        CHA: 15,
      },
      hp: { current: 18, max: 25 },
      load: { current: 8, max: 12 },
      xp: 15,
      bonds: [
        'Gareth has my back in dangerous situations',
        'I must teach Lyra the ways of magic',
      ],
      debilities: {
        weak: false,
        shaky: false,
        sick: false,
        stunned: false,
        confused: false,
        scarred: false,
      },
    },
    {
      name: 'Gareth Ironshield',
      class: 'Fighter',
      level: 4,
      race: 'Human',
      alignment: 'Lawful',
      attributes: {
        STR: 16,
        DEX: 13,
        CON: 15,
        INT: 12,
        WIS: 14,
        CHA: 11,
      },
      hp: { current: 28, max: 32 },
      load: { current: 15, max: 18 },
      xp: 8,
      bonds: [
        'Eldara\'s magic has saved my life',
        'I must protect the innocent from harm',
      ],
      debilities: {
        weak: false,
        shaky: false,
        sick: false,
        stunned: false,
        confused: false,
        scarred: false,
      },
    },
    {
      name: 'Lyra Swiftarrow',
      class: 'Ranger',
      level: 3,
      race: 'Halfling',
      alignment: 'Neutral',
      attributes: {
        STR: 13,
        DEX: 17,
        CON: 14,
        INT: 12,
        WIS: 16,
        CHA: 10,
      },
      hp: { current: 22, max: 24 },
      load: { current: 10, max: 14 },
      xp: 12,
      bonds: [
        'I guide the party through dangerous terrain',
        'The forest spirits whisper secrets to me',
      ],
      debilities: {
        weak: false,
        shaky: false,
        sick: false,
        stunned: false,
        confused: false,
        scarred: false,
      },
    },
  ]

  // Create characters in the store
  const { createCharacter, setActiveCharacter } = useCharacterStore.getState()

  sampleCharacters.forEach((charData, index) => {
    const character = createCharacter(charData as any)
    if (index === 0) {
      setActiveCharacter(character.id) // Set first character as active
    }
  })

  console.log('🎭 Mock data initialized with sample characters')
}

// Run initialization
initializeMockData()

export default initializeMockData
