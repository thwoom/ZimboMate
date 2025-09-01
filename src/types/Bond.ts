/**
 * Bond Types * Type definitions for Dungeon World bonds and related structures
 */

export enum BondStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  BROKEN = 'broken'
}

export enum BondResolutionType {
  FULFILLED = 'fulfilled',
  BROKEN = 'broken',
  CHANGED = 'changed',
  COMPLETED = 'completed'
}

export interface BondResolution {
  type: BondResolutionType;
  description: string;
  timestamp: Date;
  xpAwarded: boolean;
  notes?: string;
}

export interface Bond {
  id: string;
  characterId: string;
  targetCharacterId: string;
  description: string;
  status: BondStatus;
  createdAt: Date;
  resolvedAt: Date | null;
  xpAwarded: boolean;
  template?: string; // Reference to bond template
  notes: string;
  tags: string[];
  resolution?: BondResolution;
}

export interface BondTemplate {
  id: string;
  name: string;
  description: string;
  characterClasses: string[];
  targetClasses: string[];
  alignmentPreferences?: string[];
  tags: string[];
  xpTrigger: string;
  suggestedFor?: string; // For suggested bonds
  score?: number; // For bond suggestions
}

export interface BondStats {
  totalBonds: number;
  activeBonds: number;
  resolvedBonds: number;
  totalXPEarned: number;
  averageResolutionTime: number;
  bondsByStatus: Record < BondStatus, number>;
  bondsByTemplate: Record<string, number>;
}

export interface BondFilter {
  status?: BondStatus;
  template?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  targetCharacterId?: string;
}

export interface BondSuggestion {
  template: BondTemplate;
  targetCharacterId: string;
  score: number;
  reasoning: string[];
}
