/**
 * XP Types * Type definitions for XP triggers and XP-related structures
 */

export enum XPTriggerType {
  BOND_RESOLUTION = 'bond_resolution',
  ALIGNMENT_ACTION = 'alignment_action',
  FAILED_ROLL = 'failed_roll',
  END_OF_SESSION = 'end_of_session',
  CUSTOM = 'custom'
}

export interface XPTrigger {
  id: string;
  type: XPTriggerType;
  characterId: string;
  amount: number;
  description: string;
  timestamp: Date;
  metadata?: Record < string, unknown>;
  processed?: boolean;
}

export interface AlignmentAction {
  id: string;
  characterId: string;
  alignment: string;
  action: string;
  description: string;
  timestamp: Date;
  xpTriggered: boolean;
  xpAmount?: number;
  context?: string;
}

export interface AlignmentXPConfig {
  xpPerAlignmentAction: number;
  maxAlignmentXPPerSession: number;
  requireGMApproval: boolean;
  alignmentActions: Record < string, string[]>; // alignment -> actions[]
}

export interface XPSession {
  id: string;
  characterId: string;
  sessionDate: Date;
  totalXP: number;
  xpSources: XPTrigger[];
  alignmentActions: AlignmentAction[];
  bondsResolved: string[];
  notes?: string;
}

export interface XPStats {
  totalXP: number;
  xpBySource: Record < XPTriggerType, number>;
  alignmentActions: number;
  bondsResolved: number;
  failedRolls: number;
  sessions: number;
  averageXPPerSession: number;
}
