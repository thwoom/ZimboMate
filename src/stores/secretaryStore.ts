import type { PendingPatch, SecretaryAction, SecretaryParseResult } from '@/secretary/types'
import { useCharacterStore } from './characterStore'
import { createWithEqualityFn } from 'zustand/traditional'

export interface SecretaryEvent {
  id: string
  text: string
  actions: SecretaryAction[]
  applied: boolean
  createdAt: number
}

export interface SecretaryState {
  events: SecretaryEvent[]
  pendingPatches: PendingPatch[]
  autoApplySafe: boolean
  notes: Array<{ id: string; title: string; body?: string; links?: string[]; createdAt: number }>
  tags: Array<{ id: string; name: string; tagType: string; createdAt: number }>
  applyActions: (parse: SecretaryParseResult) => void
  applyPendingPatch: (id: string) => void
  addEvent: (parse: SecretaryParseResult, applied: boolean) => void
  setAutoApplySafe: (value: boolean) => void
  reset: () => void
}

const SAFE_HP_THRESHOLD = 20

function uid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

function isSafe(actions: SecretaryAction[]) {
  return actions.every((action) => {
    if (action.type === 'hpDelta') {
      return Math.abs(action.amount) <= SAFE_HP_THRESHOLD && action.confidence >= 0.6
    }
    if (action.type === 'xpGain') {
      return action.amount <= 3 && action.confidence >= 0.6
    }
    return action.confidence >= 0.6
  })
}

export const useSecretaryStore = createWithEqualityFn<SecretaryState>(
  (set, get) => ({
    events: [],
    pendingPatches: [],
    autoApplySafe: true,
    notes: [],
    tags: [],
    setAutoApplySafe: (value) => set({ autoApplySafe: value }),
    reset: () => set({ events: [], pendingPatches: [], notes: [], tags: [] }),

    addEvent: (parse, applied) =>
      set((state) => ({
        events: [
          {
            id: uid(),
            text: parse.text,
            actions: parse.actions,
            applied,
            createdAt: Date.now(),
          },
          ...state.events,
        ].slice(0, 100),
      })),

    applyActions: (parse) => {
      const characterStore = useCharacterStore.getState()
      const active = characterStore.getActiveCharacter?.()
      const canApplyAutomatically = get().autoApplySafe && isSafe(parse.actions)

      if (!active) {
        get().addEvent(parse, false)
        return
      }

      let appliedAny = false
      const newNotes: SecretaryState['notes'] = []
      const newTags: SecretaryState['tags'] = []
      if (canApplyAutomatically) {
        for (const action of parse.actions) {
          switch (action.type) {
            case 'hpDelta': {
              const next = (active.hp?.current ?? 0) + action.amount
              characterStore.updateHP?.(active.id, next)
              appliedAny = true
              break
            }
            case 'xpGain': {
              characterStore.addXP?.(active.id, action.amount)
              appliedAny = true
              break
            }
            case 'addDebility': {
              const update = characterStore.updateCharacter
              if (update && active.debilities) {
                update(active.id, {
                  debilities: {
                    ...active.debilities,
                    [action.debility.toLowerCase()]: true,
                  },
                } as any)
                appliedAny = true
              }
              break
            }
            case 'removeDebility': {
              const update = characterStore.updateCharacter
              if (update && active.debilities) {
                update(active.id, {
                  debilities: {
                    ...active.debilities,
                    [action.debility.toLowerCase()]: false,
                  },
                } as any)
                appliedAny = true
              }
              break
            }
            case 'addNote': {
              newNotes.push({
                id: uid(),
                title: action.title,
                body: action.body,
                links: action.links,
                createdAt: Date.now(),
              })
              appliedAny = true
              break
            }
            case 'addTag': {
              newTags.push({
                id: uid(),
                name: action.entityName,
                tagType: action.tagType,
                createdAt: Date.now(),
              })
              appliedAny = true
              break
            }
            default: {
              // For tags/notes/debilities, keep as event only for now.
            }
          }
        }
      }

      const patch: PendingPatch = {
        id: uid(),
        baseVersion: Date.now(),
        actions: parse.actions,
        status: appliedAny ? 'applied' : 'pending',
        createdAt: Date.now(),
      }

      set((state) => ({
        pendingPatches: [patch, ...state.pendingPatches].slice(0, 50),
        notes: [...newNotes, ...state.notes].slice(0, 100),
        tags: [...newTags, ...state.tags].slice(0, 100),
      }))

      get().addEvent(parse, appliedAny)
    },

    applyPendingPatch: (id: string) => {
      const patch = get().pendingPatches.find((p) => p.id === id)
      if (!patch) return
      const characterStore = useCharacterStore.getState()
      const active = characterStore.getActiveCharacter?.()
      if (!active) return

      for (const action of patch.actions) {
        switch (action.type) {
          case 'hpDelta': {
            const next = (active.hp?.current ?? 0) + action.amount
            characterStore.updateHP?.(active.id, next)
            break
          }
          case 'xpGain': {
            characterStore.addXP?.(active.id, action.amount)
            break
          }
          case 'addDebility': {
            const update = characterStore.updateCharacter
            if (update && active.debilities) {
              update(active.id, {
                debilities: {
                  ...active.debilities,
                  [action.debility.toLowerCase()]: true,
                },
              } as any)
            }
            break
          }
          case 'removeDebility': {
            const update = characterStore.updateCharacter
            if (update && active.debilities) {
              update(active.id, {
                debilities: {
                  ...active.debilities,
                  [action.debility.toLowerCase()]: false,
                },
              } as any)
            }
            break
          }
          case 'addNote': {
            set((state) => ({
              notes: [
                {
                  id: uid(),
                  title: action.title,
                  body: action.body,
                  links: action.links,
                  createdAt: Date.now(),
                },
                ...state.notes,
              ].slice(0, 100),
            }))
            break
          }
          case 'addTag': {
            set((state) => ({
              tags: [
                {
                  id: uid(),
                  name: action.entityName,
                  tagType: action.tagType,
                  createdAt: Date.now(),
                },
                ...state.tags,
              ].slice(0, 100),
            }))
            break
          }
          default:
            break
        }
      }

      set((state) => ({
        pendingPatches: state.pendingPatches.map((p) =>
          p.id === id ? { ...p, status: 'applied' } : p,
        ),
      }))
    },
  }),
)
