import { describe, expect, it } from 'vitest'

import { parseEmbeddedToolResponse } from '@/services/embeddedToolParser'

describe('parseEmbeddedToolResponse', () => {
  it('parses a clean JSON payload with tool_calls and warnings', () => {
    const raw = JSON.stringify({
      tool_calls: [
        { id: 'a', name: 'get_state', arguments: { character: 'arya' } },
        { id: 'b', name: 'apply_damage', arguments: { target: 'ghoul', amount: 5 } },
      ],
      warnings: ['low confidence'],
    })

    const result = parseEmbeddedToolResponse(raw)
    expect(result).not.toBeNull()
    expect(result?.toolCalls).toHaveLength(2)
    expect(result?.toolCalls[0]).toMatchObject({
      id: 'a',
      name: 'get_state',
    })
    expect(result?.warnings).toEqual(['low confidence'])
  })

  it('extracts JSON embedded in prose', () => {
    const raw = `Here you go!\n\n{
      "tool_calls": [
        { "name": "heal", "arguments": { "target": "lyra", "amount": 3 } }
      ]
    }\nThanks!`

    const result = parseEmbeddedToolResponse(raw)
    expect(result).not.toBeNull()
    expect(result?.toolCalls).toHaveLength(1)
    expect(result?.toolCalls[0]?.name).toBe('heal')
  })

  it('falls back to array payloads', () => {
    const raw = JSON.stringify([{ name: 'get_state', arguments: { character: 'cat' } }])
    const result = parseEmbeddedToolResponse(raw)
    expect(result).not.toBeNull()
    expect(result?.toolCalls).toHaveLength(1)
    expect(result?.warnings).toEqual([])
  })

  it('returns null for invalid JSON text', () => {
    expect(parseEmbeddedToolResponse('completely invalid')).toBeNull()
  })
})
