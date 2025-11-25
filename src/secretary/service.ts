import type { SecretaryParseResult } from './types'
import { parseWithRules } from './rules'

export interface SecretaryOptions {
  minModelConfidence?: number
  enableModel?: boolean
}

/**
 * Parse narration into structured actions.
 * Currently rule-first; hook for an offline LLM can be added later.
 */
export async function parseNarration(
  text: string,
  options: SecretaryOptions = {},
): Promise<SecretaryParseResult> {
  const ruleResult = parseWithRules(text)

  // In a future iteration we could call a local model if confidence is low.
  const needsModel = options.enableModel && ruleResult.confidence < (options.minModelConfidence ?? 0.6)
  if (!needsModel) {
    return ruleResult
  }

  // Placeholder: return rules for now. Hook a model-generated merge here.
  return ruleResult
}
