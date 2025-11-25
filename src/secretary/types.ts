export type SecretaryActionType =
  | 'hpDelta'
  | 'xpGain'
  | 'addNote'
  | 'addTag'
  | 'addDebility'
  | 'removeDebility'

export interface SecretaryActionBase {
  type: SecretaryActionType
  confidence: number // 0..1
  from: 'rules' | 'model'
  note?: string
}

export interface HpDeltaAction extends SecretaryActionBase {
  type: 'hpDelta'
  amount: number // negative for damage
  targetId?: string
  source?: string
}

export interface XpGainAction extends SecretaryActionBase {
  type: 'xpGain'
  amount: number
  reason?: string
}

export interface AddNoteAction extends SecretaryActionBase {
  type: 'addNote'
  title: string
  body?: string
  links?: string[] // entity names
}

export interface AddTagAction extends SecretaryActionBase {
  type: 'addTag'
  entityName: string
  tagType: 'npc' | 'location' | 'item' | 'threat' | 'ally'
}

export interface AddDebilityAction extends SecretaryActionBase {
  type: 'addDebility'
  debility: 'Weak' | 'Shaky' | 'Sick' | 'Stunned' | 'Confused' | 'Scarred'
}

export interface RemoveDebilityAction extends SecretaryActionBase {
  type: 'removeDebility'
  debility: AddDebilityAction['debility']
}

export type SecretaryAction =
  | HpDeltaAction
  | XpGainAction
  | AddNoteAction
  | AddTagAction
  | AddDebilityAction
  | RemoveDebilityAction

export interface SecretaryParseResult {
  text: string
  actions: SecretaryAction[]
  confidence: number
  createdAt: number
}

export interface PendingPatch {
  id: string
  baseVersion: number
  actions: SecretaryAction[]
  status: 'pending' | 'applied' | 'rejected'
  reason?: string
  createdAt: number
}

