export interface EmbeddedToolCallPayload {
  id?: string
  name?: string
  arguments?: unknown
}

export interface EmbeddedToolResponsePayload {
  toolCalls: EmbeddedToolCallPayload[]
  warnings: string[]
}

function tryParseJson(raw: string): unknown {
  const attempts: string[] = []
  const trimmed = raw.trim()

  if (trimmed.length === 0) {
    return null
  }

  attempts.push(trimmed)

  const braceStart = trimmed.indexOf('{')
  const braceEnd = trimmed.lastIndexOf('}')
  if (braceStart !== -1 && braceEnd > braceStart) {
    attempts.push(trimmed.slice(braceStart, braceEnd + 1))
  }

  const bracketStart = trimmed.indexOf('[')
  const bracketEnd = trimmed.lastIndexOf(']')
  if (bracketStart !== -1 && bracketEnd > bracketStart) {
    attempts.push(trimmed.slice(bracketStart, bracketEnd + 1))
  }

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate)
    } catch {
      continue
    }
  }

  return null
}

function normalizeToolCalls(value: unknown): EmbeddedToolCallPayload[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map((entry) =>
        entry && typeof entry === 'object'
          ? {
              id: typeof (entry as { id?: unknown }).id === 'string' ? (entry as { id?: string }).id : undefined,
              name:
                typeof (entry as { name?: unknown }).name === 'string'
                  ? (entry as { name?: string }).name
                  : undefined,
              arguments: (entry as { arguments?: unknown }).arguments,
            }
          : null,
      )
      .filter((entry): entry is EmbeddedToolCallPayload => Boolean(entry?.name))
  }
  return []
}

function normalizeWarnings(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
}

export function parseEmbeddedToolResponse(raw: string): EmbeddedToolResponsePayload | null {
  const parsed = tryParseJson(raw)
  if (!parsed) {
    return null
  }

  if (Array.isArray(parsed)) {
    return {
      toolCalls: normalizeToolCalls(parsed),
      warnings: [],
    }
  }

  if (typeof parsed === 'object') {
    const payload = parsed as {
      tool_calls?: unknown
      warnings?: unknown
    }
    return {
      toolCalls: normalizeToolCalls(payload.tool_calls),
      warnings: normalizeWarnings(payload.warnings),
    }
  }

  return null
}
