import type { BootStageSnapshot, BootStageStatus } from './types'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Laptop,
  Loader2,
  ShieldHalf,
  WifiOff,
} from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/utils'
import { useBoot } from './BootProvider'
import { bootTips } from './bootTips'

const statusConfig: Record<BootStageStatus, { label: string; tone: 'muted' | 'ready' | 'warn' | 'error'; Icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', tone: 'muted', Icon: Clock3 },
  active: { label: 'In progress', tone: 'muted', Icon: Loader2 },
  success: { label: 'Ready', tone: 'ready', Icon: CheckCircle2 },
  warning: { label: 'Needs attention', tone: 'warn', Icon: AlertTriangle },
  failed: { label: 'Failed', tone: 'error', Icon: AlertTriangle },
  skipped: { label: 'Skipped', tone: 'muted', Icon: Clock3 },
}

const toneClass: Record<'muted' | 'ready' | 'warn' | 'error', string> = {
  muted: 'text-muted-foreground border-border/50',
  ready: 'text-emerald-400 border-emerald-500/40',
  warn: 'text-amber-400 border-amber-500/50',
  error: 'text-red-400 border-red-500/50',
}

interface StageRowProps {
  stage: BootStageSnapshot
  isActive: boolean
  prefersReducedMotion: boolean
}

const StageRow: React.FC<StageRowProps> = ({ stage, isActive, prefersReducedMotion }) => {
  const config = statusConfig[stage.status]
  const Icon = config.Icon
  const showSpinner = stage.status === 'active' && !prefersReducedMotion
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-2xl border bg-card/60 px-4 py-3 text-sm transition-colors',
        toneClass[config.tone],
        isActive && 'ring-1 ring-primary/40',
      )}
    >
      <div>
        <p className='font-semibold text-foreground'>{stage.label}</p>
        <p className='text-xs text-muted-foreground'>{stage.message ?? stage.description}</p>
      </div>
      <div className='flex items-center gap-2 text-xs font-medium'>
        <Icon className={cn('h-4 w-4', showSpinner && 'animate-spin')} aria-hidden='true' />
        {config.label}
      </div>
    </div>
  )
}

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = React.useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches)
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handler)
      return () => mediaQuery.removeListener(handler)
    }
    return undefined
  }, [])

  return reduced
}

export function LoadingGate() {
  const { snapshot, dismissed, dismiss, retryStage, toggleSafeMode } = useBoot()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [tipIndex, setTipIndex] = React.useState(0)
  const [isOnline, setIsOnline] = React.useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  React.useEffect(() => {
    if (prefersReducedMotion) return undefined
    if (bootTips.length <= 1) return undefined
    if (typeof window === 'undefined') return undefined
    const id = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % bootTips.length)
    }, 6500)
    return () => window.clearInterval(id)
  }, [prefersReducedMotion])

  const shouldRender = !dismissed
  if (!shouldRender) return null

  const activeStage = snapshot.stages.find((stage) => stage.id === snapshot.activeStageId)
  const fallbackStage = snapshot.stages.find((stage) => stage.status === 'pending')
  const stageForCopy = activeStage ?? fallbackStage ?? snapshot.stages[0]
  const tip = bootTips[tipIndex] ?? bootTips[0]
  const lastDiagnostic = snapshot.diagnostics.at(-1)
  const envLabel = import.meta.env.MODE === 'production' ? 'Production build' : 'Development build'
  const isDesktop = typeof window !== 'undefined' && '__TAURI__' in window

  const overlayMotion = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

  const cardMotion = prefersReducedMotion
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 0 } }
    : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -24 } }

  const handleRetry = () => {
    void retryStage(snapshot.activeStageId)
  }

  const handleSafeModeToggle = () => {
    toggleSafeMode(!snapshot.safeModeEnabled)
  }

  return (
    <AnimatePresence>
      <motion.div
        key='loading-gate-overlay'
        className='fixed inset-0 z-[130] flex items-center justify-center bg-[radial-gradient(circle_at_top,var(--background)_0%,color-mix(in_oklch,var(--background)_70%,black)_60%)]/95 px-4 py-8 backdrop-blur-sm'
        {...overlayMotion}
      >
        <motion.div
          key='loading-gate-card'
          {...cardMotion}
          className='w-full max-w-5xl'
        >
          <Card variant='parchment' className='relative overflow-hidden border border-border/60 bg-background/90 shadow-2xl shadow-black/40'>
            <div className='pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-3xl' />
            <CardHeader className='pb-4'>
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <p className='text-sm uppercase tracking-[0.3em] text-muted-foreground'>ZimboMate</p>
                  <CardTitle className='font-display text-2xl text-foreground'>Preparing your storyteller grimoire</CardTitle>
                </div>
                <Badge variant='secondary' className='flex items-center gap-1 text-xs'>
                  <Laptop className='h-3.5 w-3.5' />
                  {isDesktop ? 'Desktop' : 'Web'} · {envLabel}
                </Badge>
              </div>
              <div className='mt-4 space-y-2' role='progressbar' aria-valuemin={0} aria-valuemax={100} aria-valuenow={snapshot.percent} aria-describedby='boot-current-stage'>
                <Progress value={snapshot.percent} className='h-3 bg-secondary/50' />
                <div id='boot-current-stage' className='flex items-center justify-between text-sm text-muted-foreground'>
                  <span>
                    {stageForCopy?.label ?? 'Preparing'} · {stageForCopy?.message ?? stageForCopy?.description}
                  </span>
                  <span>{snapshot.percent}%</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className='grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]'>
              <section aria-label='Boot stages' className='space-y-2'>
                {snapshot.stages.map((stage) => (
                  <StageRow
                    key={stage.id}
                    stage={stage}
                    isActive={stage.id === snapshot.activeStageId}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                ))}
              </section>

              <aside className='space-y-4 rounded-2xl border border-border/40 bg-card/40 p-4'>
                <div className='flex items-center justify-between gap-2'>
                  <Badge variant={isOnline ? 'outline' : 'destructive'} className='flex items-center gap-1 text-xs'>
                    {isOnline ? (
                      <Loader2 className={cn('h-3 w-3', !prefersReducedMotion && 'animate-spin')} />
                    ) : (
                      <WifiOff className='h-3.5 w-3.5' />
                    )}
                    {isOnline ? 'Online' : 'Offline mode'}
                  </Badge>
                  {snapshot.safeModeEnabled && (
                    <Badge variant='secondary' className='flex items-center gap-1 text-xs text-amber-500'>
                      <ShieldHalf className='h-3.5 w-3.5' /> Safe mode
                    </Badge>
                  )}
                </div>

                <div className='rounded-xl border border-border/40 bg-background/70 p-4'>
                  <p className='text-xs uppercase tracking-[0.35em] text-muted-foreground'>Quick tip</p>
                  <h3 className='mt-2 font-serif text-lg text-foreground'>{tip.title}</h3>
                  <p className='text-sm text-muted-foreground'>{tip.body}</p>
                </div>

                <div className='space-y-2'>
                  <Button variant='secondary' size='sm' className='w-full justify-center' onClick={handleSafeModeToggle}>
                    {snapshot.safeModeEnabled ? 'Disable Safe Mode' : 'Enable Safe Mode'}
                  </Button>
                  <Button variant='outline' size='sm' className='w-full justify-center' onClick={handleRetry} disabled={!snapshot.activeStageId}>
                    Retry {activeStage?.label ?? 'current stage'}
                  </Button>
                  <Button variant='ghost' size='sm' className='w-full justify-center text-muted-foreground hover:text-foreground' onClick={dismiss}>
                    Continue in background
                  </Button>
                </div>

                {lastDiagnostic && (
                  <div className='rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-100'>
                    {lastDiagnostic.message}
                  </div>
                )}
              </aside>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
