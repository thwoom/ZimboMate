import type { BootOrchestrator } from './bootOrchestrator'
import type { BootStageId } from './types'
import { useAppModeStore } from '@/stores/appModeStore'
import { useCampaignStore } from '@/stores/campaignStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useCombatStore } from '@/stores/combatStore'
import { useDiceStore } from '@/stores/diceStore'
import { useInventoryStore } from '@/stores/inventoryStore'

interface PersistAwareStore {
  persist?: {
    hasHydrated?: () => boolean
    onFinishHydration?: (callback: () => void) => () => void
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

async function waitForStoreHydration(label: string, store: PersistAwareStore, timeoutMs = 6000) {
  if (!store.persist) return
  if (store.persist.hasHydrated?.()) return

  await new Promise<void>((resolve) => {
    let resolved = false
    let unsubscribe: (() => void) | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    const done = () => {
      if (resolved) return
      resolved = true
      if (typeof timer !== 'undefined') {
        clearTimeout(timer)
      }
      unsubscribe?.()
      resolve()
    }

    unsubscribe = store.persist?.onFinishHydration?.(() => done())
    timer = setTimeout(() => {
      done()
    }, timeoutMs)
  })
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown issue detected'
}

async function preloadFonts(orchestrator: BootOrchestrator) {
  orchestrator.beginStage('fontFace', 'Loading signature fonts')
  try {
    const doc = typeof document !== 'undefined' ? (document as Document & { fonts?: FontFaceSet }) : undefined
    if (doc?.fonts?.ready) {
      await doc.fonts.ready
    } else {
      await sleep(120)
    }
    orchestrator.completeStage('fontFace', 'Nunito + Cinzel locked in')
  } catch (error) {
    orchestrator.warnStage('fontFace', `Fonts delayed: ${formatError(error)}`)
  }
}

async function hydrateStoreGroup(orchestrator: BootOrchestrator) {
  orchestrator.beginStage('storeHydration', 'Restoring journals and dice history')
  const stores: Array<[string, PersistAwareStore]> = [
    ['App mode', useAppModeStore],
    ['Characters', useCharacterStore],
    ['Dice', useDiceStore],
    ['Campaigns', useCampaignStore],
    ['Inventory', useInventoryStore],
    ['Combat', useCombatStore],
  ]

  let completed = 0
  for (const [label, store] of stores) {
    await waitForStoreHydration(label, store)
    completed += 1
    orchestrator.setStageProgress(
      'storeHydration',
      (completed / stores.length) * 100,
      `${label} ready`,
    )
  }

  orchestrator.completeStage('storeHydration', 'State restored locally')
}

async function prepareCharacters(orchestrator: BootOrchestrator) {
  orchestrator.beginStage('characterData', 'Summoning last hero')
  try {
    await sleep(60)
    const state = useCharacterStore.getState()
    const active = state.getActiveCharacter ? state.getActiveCharacter() : state.characters[0]
    orchestrator.completeStage(
      'characterData',
      active ? `${active.name} is ready` : 'Ready for a brand-new hero',
    )
  } catch (error) {
    orchestrator.warnStage('characterData', `Character prep issue: ${formatError(error)}`)
  }
}

async function prefetchRoutes(orchestrator: BootOrchestrator) {
  orchestrator.beginStage('routePrefetch', 'Mapping major panes')
  const loaders: Array<() => Promise<unknown>> = []

  let completed = 0
  for (const load of loaders) {
    try {
      await load()
    } catch (error) {
      orchestrator.warnStage('routePrefetch', `Prefetch issue: ${formatError(error)}`)
      continue
    }
    completed += 1
    orchestrator.setStageProgress(
      'routePrefetch',
      (completed / loaders.length) * 100,
      `${completed}/${loaders.length} panes cached`,
    )
  }

  orchestrator.completeStage('routePrefetch', 'Primary panes cached')
}

async function primeEffects(orchestrator: BootOrchestrator) {
  orchestrator.beginStage('fxReady', 'Priming dice and toast effects')
  try {
    orchestrator.completeStage('fxReady', 'Effects warmed up')
  } catch (error) {
    orchestrator.warnStage('fxReady', `Effects preload issue: ${formatError(error)}`)
  }
}

async function finalize(orchestrator: BootOrchestrator, prerequisites: Promise<unknown>[]) {
  orchestrator.beginStage('finalize', 'Final checks')
  try {
    await Promise.all(prerequisites)
    await sleep(140)
    orchestrator.completeStage('finalize', 'Handoff complete')
  } catch (error) {
    orchestrator.failStage('finalize', `Unable to finish boot: ${formatError(error)}`)
  }
}

export interface BootTaskController {
  startAll: () => void
  retryStage: (id: BootStageId | null) => Promise<void>
}

export function createBootTaskController(orchestrator: BootOrchestrator): BootTaskController {
  const stagePromises = new Map<BootStageId, Promise<void>>()
  const stageRunners: Partial<Record<BootStageId, () => Promise<void>>> = {}

  const isStageSettled = (id: BootStageId) => {
    const snapshot = orchestrator.snapshot()
    const stage = snapshot.stages.find((entry) => entry.id === id)
    if (!stage) return false
    return stage.status === 'success' || stage.status === 'warning' || stage.status === 'skipped'
  }

  function track(id: BootStageId, runner: () => Promise<void>) {
    const promise = runner().finally(() => {
      if (stagePromises.get(id) === promise) {
        stagePromises.delete(id)
      }
    })
    stagePromises.set(id, promise)
    return promise
  }

  function ensureStage(id: BootStageId): Promise<void> {
    if (isStageSettled(id)) {
      return Promise.resolve()
    }
    const existing = stagePromises.get(id)
    if (existing) return existing
    const runner = stageRunners[id]
    if (!runner) return Promise.resolve()
    return track(id, runner)
  }

  stageRunners.themeTokens = async () => {
    orchestrator.beginStage('themeTokens', 'Infusing Matsu palette')
    await sleep(50)
    orchestrator.completeStage('themeTokens', 'Palette locked')
  }

  stageRunners.fontFace = () => preloadFonts(orchestrator)
  stageRunners.storeHydration = () => hydrateStoreGroup(orchestrator)
  stageRunners.characterData = async () => {
    await ensureStage('storeHydration')
    return prepareCharacters(orchestrator)
  }
  stageRunners.routePrefetch = () => prefetchRoutes(orchestrator)
  stageRunners.fxReady = () => primeEffects(orchestrator)
  stageRunners.finalize = () =>
    finalize(orchestrator, [
      ensureStage('themeTokens'),
      ensureStage('fontFace'),
      ensureStage('storeHydration'),
      ensureStage('characterData'),
      ensureStage('routePrefetch'),
      ensureStage('fxReady'),
    ])

  const startAll = () => {
    ensureStage('themeTokens')
    ensureStage('fontFace')
    ensureStage('storeHydration')
    ensureStage('characterData')
    ensureStage('routePrefetch')
    ensureStage('fxReady')
    ensureStage('finalize')
  }

  const retryStage = (id: BootStageId | null) => {
    if (!id) return Promise.resolve()
    const runner = stageRunners[id]
    if (!runner) return Promise.resolve()
    return track(id, runner)
  }

  return { startAll, retryStage }
}
