/**
 * Monster Store for ZimboMate V2
 * Manages monster templates, custom creatures, and combat integration
 */

import type {
  MonsterOrigin,
  MonsterTag,
  MonsterTemplate,
  QuickMonster,
} from '../models/Monster'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createQuickMonster,
  DW_MONSTER_TEMPLATES,
  monsterToCombatParticipant,
  scaleMonster,
} from '../models/Monster'

interface MonsterState {
  // Template management
  officialTemplates: MonsterTemplate[]
  customTemplates: MonsterTemplate[]
  favorites: string[] // Template IDs

  // Quick monsters for ad-hoc encounters
  quickMonsters: QuickMonster[]

  // Template operations
  addCustomTemplate: (
    template: Omit<MonsterTemplate, 'id' | 'createdAt' | 'updatedAt'>,
  ) => void
  updateTemplate: (id: string, updates: Partial<MonsterTemplate>) => void
  deleteTemplate: (id: string) => void
  duplicateTemplate: (id: string, newName?: string) => void

  // Quick monster operations
  createQuickMonster: (
    name: string,
    hp: number,
    armor: number,
    damage: string,
    tags?: MonsterTag[],
    instinct?: string,
    moves?: string[],
  ) => void
  updateQuickMonster: (index: number, updates: Partial<QuickMonster>) => void
  deleteQuickMonster: (index: number) => void

  // Favorites
  toggleFavorite: (templateId: string) => void
  getFavoriteTemplates: () => MonsterTemplate[]

  // Search and filtering
  searchTemplates: (
    query: string,
    origin?: MonsterOrigin,
    tags?: MonsterTag[],
  ) => MonsterTemplate[]
  getTemplatesByLevel: (minLevel: number, maxLevel: number) => MonsterTemplate[]

  // Combat integration
  addToCombat: (template: MonsterTemplate | QuickMonster, level?: number) => any
  createEncounterGroup: (templateIds: string[], count: number[]) => any[]

  // Scaling and customization
  scaleTemplateForLevel: (
    templateId: string,
    level: number,
  ) => MonsterTemplate | null

  // Utility
  getAllTemplates: () => MonsterTemplate[]
  getTemplateById: (id: string) => MonsterTemplate | null
}

export const useMonsterStore = create<MonsterState>()(
  persist(
    (set, get) => ({
      // Initial state
      officialTemplates: DW_MONSTER_TEMPLATES,
      customTemplates: [],
      favorites: [],
      quickMonsters: [],

      // Template operations
      addCustomTemplate: (templateData) => {
        const newTemplate: MonsterTemplate = {
          ...templateData,
          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          official: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({
          customTemplates: [...state.customTemplates, newTemplate],
        }))
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          customTemplates: state.customTemplates.map((template) =>
            template.id === id
              ? { ...template, ...updates, updatedAt: new Date() }
              : template,
          ),
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({
          customTemplates: state.customTemplates.filter(
            (template) => template.id !== id,
          ),
          favorites: state.favorites.filter((fav) => fav !== id),
        }))
      },

      duplicateTemplate: (id, newName) => {
        const template = get().getTemplateById(id)
        if (!template) return

        const duplicatedTemplate: MonsterTemplate = {
          ...template,
          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: newName || `${template.name} (Copy)`,
          official: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({
          customTemplates: [...state.customTemplates, duplicatedTemplate],
        }))
      },

      // Quick monster operations
      createQuickMonster: (
        name,
        hp,
        armor,
        damage,
        tags = [],
        instinct = 'To survive',
        moves = ['Attack'],
      ) => {
        const quickMonster = createQuickMonster(
          name,
          hp,
          armor,
          damage,
          tags,
          instinct,
          moves,
        )
        set((state) => ({
          quickMonsters: [...state.quickMonsters, quickMonster],
        }))
      },

      updateQuickMonster: (index, updates) => {
        set((state) => ({
          quickMonsters: state.quickMonsters.map((monster, i) =>
            i === index ? { ...monster, ...updates } : monster,
          ),
        }))
      },

      deleteQuickMonster: (index) => {
        set((state) => ({
          quickMonsters: state.quickMonsters.filter((_, i) => i !== index),
        }))
      },

      // Favorites
      toggleFavorite: (templateId) => {
        set((state) => ({
          favorites: state.favorites.includes(templateId)
            ? state.favorites.filter((id) => id !== templateId)
            : [...state.favorites, templateId],
        }))
      },

      getFavoriteTemplates: () => {
        const { favorites, getAllTemplates } = get()
        return getAllTemplates().filter((template) =>
          favorites.includes(template.id),
        )
      },

      // Search and filtering
      searchTemplates: (query, origin, tags) => {
        const allTemplates = get().getAllTemplates()
        return allTemplates.filter((template) => {
          const matchesQuery =
            !query ||
            template.name.toLowerCase().includes(query.toLowerCase()) ||
            template.description.toLowerCase().includes(query.toLowerCase()) ||
            template.instinct.toLowerCase().includes(query.toLowerCase())

          const matchesOrigin = !origin || template.origin === origin

          const matchesTags =
            !tags ||
            tags.length === 0 ||
            tags.every((tag) => template.tags.includes(tag))

          return matchesQuery && matchesOrigin && matchesTags
        })
      },

      getTemplatesByLevel: (minLevel, maxLevel) => {
        const allTemplates = get().getAllTemplates()
        return allTemplates.filter((template) => {
          const templateMin = template.minLevel || 1
          const templateMax = template.maxLevel || 10
          return templateMin <= maxLevel && templateMax >= minLevel
        })
      },

      // Combat integration
      addToCombat: (template, level) => {
        let finalTemplate: MonsterTemplate | QuickMonster = template

        // Scale official template if level provided
        if ('official' in template && template.official && level) {
          finalTemplate = scaleMonster(template, level)
        }

        return monsterToCombatParticipant(finalTemplate)
      },

      createEncounterGroup: (templateIds, counts) => {
        const { getTemplateById } = get()
        const participants: any[] = []

        templateIds.forEach((templateId, index) => {
          const template = getTemplateById(templateId)
          if (!template) return

          const count = counts[index] || 1
          for (let i = 0; i < count; i++) {
            const participant = monsterToCombatParticipant(
              template,
              `${templateId}-${i + 1}`,
            )
            participant.name =
              count > 1 ? `${template.name} ${i + 1}` : template.name
            participants.push(participant)
          }
        })

        return participants
      },

      // Scaling
      scaleTemplateForLevel: (templateId, level) => {
        const template = get().getTemplateById(templateId)
        if (!template) return null
        return scaleMonster(template, level)
      },

      // Utility
      getAllTemplates: () => {
        const { officialTemplates, customTemplates } = get()
        return [...officialTemplates, ...customTemplates]
      },

      getTemplateById: (id) => {
        const allTemplates = get().getAllTemplates()
        return allTemplates.find((template) => template.id === id) || null
      },
    }),
    {
      name: 'zimbomate-monster-storage',
      partialize: (state) => ({
        customTemplates: state.customTemplates,
        favorites: state.favorites,
        quickMonsters: state.quickMonsters,
        // Don't persist official templates - they're loaded from the model
      }),
    },
  ),
)
