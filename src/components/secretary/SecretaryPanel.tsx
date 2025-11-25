import React, { useCallback, useMemo, useState } from 'react'
import type { SecretaryAction } from '@/secretary/types'
import { parseNarration } from '@/secretary/service'
import { useSecretaryStore } from '@/stores/secretaryStore'
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui'

function ActionChip({ action }: { action: SecretaryAction }) {
  const label = useMemo(() => {
    switch (action.type) {
      case 'hpDelta':
        return `${action.amount > 0 ? '+' : ''}${action.amount} HP`
      case 'xpGain':
        return `+${action.amount} XP`
      case 'addDebility':
        return `Debility: ${action.debility}`
      case 'removeDebility':
        return `Clear ${action.debility}`
      case 'addTag':
        return `Tag: ${action.entityName}`
      case 'addNote':
        return `Note: ${action.title}`
      default:
        return action.type
    }
  }, [action])

  return (
    <Badge variant="outline" className="mr-1 mb-1">
      {label}
      <span className="ml-1 text-muted-foreground text-xs">{Math.round(action.confidence * 100)}%</span>
    </Badge>
  )
}

export const SecretaryPanel: React.FC = () => {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const applyActions = useSecretaryStore((s) => s.applyActions)
  const events = useSecretaryStore((s) => s.events)
  const autoApplySafe = useSecretaryStore((s) => s.autoApplySafe)
  const setAutoApplySafe = useSecretaryStore((s) => s.setAutoApplySafe)
  const pending = useSecretaryStore((s) => s.pendingPatches.filter((p) => p.status === 'pending'))
  const applyPending = useSecretaryStore((s) => s.applyPendingPatch)

  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault()
      if (!text.trim() || busy) return
      setBusy(true)
      const parsed = await parseNarration(text.trim(), { enableModel: false })
      applyActions(parsed)
      setText('')
      setBusy(false)
    },
    [text, busy, applyActions],
  )

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Secretary</div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground cursor-help">Auto-apply safe</span>
              </TooltipTrigger>
              <TooltipContent>Automatically apply low-risk HP/XP changes.</TooltipContent>
            </Tooltip>
            <Switch checked={autoApplySafe} onCheckedChange={setAutoApplySafe} />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder='e.g. "A goblin hit me for 3 damage"'
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button type="submit" disabled={busy || !text.trim()}>
            {busy ? 'Parsing…' : 'Apply'}
          </Button>
        </form>
        {events.length > 0 && (
          <div className="space-y-2">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="rounded border px-2 py-1">
                <div className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleTimeString()}</div>
                <div className="text-sm">{event.text}</div>
                <div className="flex flex-wrap mt-1">
                  {event.actions.map((action, idx) => (
                    <ActionChip key={`${event.id}-${action.type}-${idx}`} action={action} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {pending.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold">Pending actions</div>
            {pending.slice(0, 3).map((patch) => (
              <div key={patch.id} className="rounded border px-2 py-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(patch.createdAt).toLocaleTimeString()}</span>
                  <Button size="xs" variant="outline" onClick={() => applyPending(patch.id)}>
                    Apply
                  </Button>
                </div>
                <div className="flex flex-wrap mt-1">
                  {patch.actions.map((action, idx) => (
                    <ActionChip key={`${patch.id}-${action.type}-${idx}`} action={action} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SecretaryPanel
