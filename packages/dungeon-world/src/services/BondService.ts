/**
 * Bond Service * Handles bond creation, management, resolution, and XP tracking for Dungeon World
 */

import type { Character } from '../models/Character'
import type { Bond, BondResolution, BondTemplate } from '../types/Bond'
import type { XPTrigger } from '../types/XP'
import { BondStatus } from '../types/Bond'
import { XPTriggerType } from '../types/XP'

export interface BondServiceConfig {
  maxBondsPerCharacter: number
  xpPerBondResolution: number
  enableAutoXP: boolean
}

export class BondService {
  private static instance: BondService
  private config: BondServiceConfig = {
    maxBondsPerCharacter: 3,
    xpPerBondResolution: 1,
    enableAutoXP: true,
  }

  private bonds: Map <string, Bond[]> = new Map() // characterId -> bonds[]
  private bondTemplates: BondTemplate[] = []

  private constructor() {
    this.loadBondTemplates()
  }

  static getInstance(): BondService {
    if (!BondService.instance) {
      BondService.instance = new BondService()
    }
    return BondService.instance
  }

  /**
   * Create a new bond between characters
   */
  createBond(
    characterId: string,
    targetCharacterId: string,
    description: string,
    template?: BondTemplate,
  ): Bond {
    const bond: Bond = {
      id: this.generateBondId(),
      characterId,
      targetCharacterId,
      description,
      status: BondStatus.ACTIVE,
      createdAt: new Date(),
      resolvedAt: null,
      xpAwarded: false,
      template: template?.id,
      notes: '',
      tags: template?.tags || [],
    }

    this.addBondToCharacter(characterId, bond)
    return bond
  }

  /**
   * Get all bonds for a character
   */
  getBondsForCharacter(characterId: string): Bond[] {
    return this.bonds.get(characterId) || []
  }

  /**
   * Get bonds where character is the target
   */
  getBondsTargetingCharacter(characterId: string): Bond[] {
    const allBonds: Bond[] = []
    for (const bonds of this.bonds) {
      for (const bond of bonds) {
        if (bond.targetCharacterId === characterId) {
          allBonds.push(bond)
        }
      }
    }
    return allBonds
  }

  /**
   * Resolve a bond and award XP
   */
  resolveBond(bondId: string, resolution: BondResolution): XPTrigger | null {
    const bond = this.findBondById(bondId)
    if (!bond || bond.status === BondStatus.RESOLVED) {
      return null
    }

    bond.status = BondStatus.RESOLVED
    bond.resolvedAt = new Date()
    bond.resolution = resolution

    // Award XP if enabled and not already awarded
    if (this.config.enableAutoXP && !bond.xpAwarded) {
      bond.xpAwarded = true
      return {
        id: `bond-${bondId}`,
        type: XPTriggerType.BOND_RESOLUTION,
        characterId: bond.characterId,
        amount: this.config.xpPerBondResolution,
        description: `Bond resolved: ${bond.description}`,
        timestamp: new Date(),
        metadata: {
          bondId,
          resolution: resolution.type,
          targetCharacterId: bond.targetCharacterId,
        },
      }
    }

    return null
  }

  /**
   * Update bond description or notes
   */
  updateBond(bondId: string, updates: Partial<Bond>): Bond | null {
    const bond = this.findBondById(bondId)
    if (!bond) {
      return null
    }

    Object.assign(bond, updates)
    return bond
  }

  /**
   * Delete a bond
   */
  deleteBond(bondId: string): boolean {
    const bond = this.findBondById(bondId)
    if (!bond) {
      return false
    }

    const characterBonds = this.bonds.get(bond.characterId)
    if (characterBonds) {
      const index = characterBonds.findIndex(b => b.id === bondId)
      if (index !== -1) {
        characterBonds.splice(index, 1)
        return true
      }
    }

    return false
  }

  /**
   * Get bond templates for character type
   */
  getBondTemplates(characterClass?: string): BondTemplate[] {
    if (!characterClass) {
      return this.bondTemplates
    }
    return this.bondTemplates.filter(template =>
      template.characterClasses.includes(characterClass),
    )
  }

  /**
   * Suggest bonds based on character relationships and history
   */
  suggestBonds(character: Character, otherCharacters: Character[]): BondTemplate[] {
    const suggestions: BondTemplate[] = []
    const existingBonds = this.getBondsForCharacter(character.id)
    const existingTargetIds = new Set(existingBonds.map(b => b.targetCharacterId))

    // Filter out characters already bonded with
    const availableCharacters = otherCharacters.filter(c =>
      c.id !== character.id && !existingTargetIds.has(c.id),
    )

    if (availableCharacters.length === 0) {
      return suggestions
    }

    // Get templates for character class
    const classTemplates = this.getBondTemplates(character.class)

    // Score templates based on character relationships and history
    for (const template of classTemplates) {
      for (const targetChar of availableCharacters) {
        const score = this.scoreBondTemplate(template, character, targetChar)
        if (score > 0.5) { // Only suggest bonds with good fit
          suggestions.push({
            ...template,
            suggestedFor: targetChar.id,
            score,
          })
        }
      }
    }

    return suggestions.sort((a, b) => (b.score || 0) - (a.score || 0))
  }

  /**
   * Get bond statistics for a character
   */
  getBondStats(characterId: string): {
    totalBonds: number
    activeBonds: number
    resolvedBonds: number
    totalXPEarned: number
    averageResolutionTime: number
  } {
    const bonds = this.getBondsForCharacter(characterId)
    const resolvedBonds = bonds.filter(b => b.status === BondStatus.RESOLVED)

    let totalXPEarned = 0
    let totalResolutionTime = 0

    for (const bond of resolvedBonds) {
      if (bond.xpAwarded) {
        totalXPEarned += this.config.xpPerBondResolution
      }
      if (bond.createdAt && bond.resolvedAt) {
        totalResolutionTime += bond.resolvedAt.getTime() - bond.createdAt.getTime()
      }
    }

    return {
      totalBonds: bonds.length,
      activeBonds: bonds.filter(b => b.status === BondStatus.ACTIVE).length,
      resolvedBonds: resolvedBonds.length,
      totalXPEarned,
      averageResolutionTime: resolvedBonds.length > 0
        ? totalResolutionTime / resolvedBonds.length
        : 0,
    }
  }

  /**
   * Export bonds for a character
   */
  exportBonds(characterId: string): string {
    const bonds = this.getBondsForCharacter(characterId)
    return JSON.stringify(bonds, null, 2)
  }

  /**
   * Import bonds for a character
   */
  importBonds(characterId: string, bondsData: string): boolean {
    try {
      const bonds: Bond[] = JSON.parse(bondsData)
      this.bonds.set(characterId, bonds)
      return true
    }
    catch {
      return false
    }
  }

  // Private helper methods

  private generateBondId(): string {
    return `bond-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }

  private addBondToCharacter(characterId: string, bond: Bond): void {
    if (!this.bonds.has(characterId)) {
      this.bonds.set(characterId, [])
    }
    this.bonds.get(characterId)!.push(bond)
  }

  private findBondById(bondId: string): Bond | null {
    for (const bonds of this.bonds.values()) {
      const bond = bonds.find(b => b.id === bondId)
      if (bond) {
        return bond
      }
    }
    return null
  }

  private scoreBondTemplate(
    template: BondTemplate,
    character: Character,
    targetCharacter: Character,
  ): number {
    let score = 0.5 // Base score

    // Class compatibility
    if (template.characterClasses.includes(character.class)) {
      score += 0.2
    }
    if (template.targetClasses.includes(targetCharacter.class)) {
      score += 0.2
    }

    // Alignment compatibility
    if (template.alignmentPreferences) {
      const charAlignment = character.alignment
      const targetAlignment = targetCharacter.alignment

      if (template.alignmentPreferences.includes(charAlignment)) {
        score += 0.1
      }
      if (template.alignmentPreferences.includes(targetAlignment)) {
        score += 0.1
      }
    }

    // Relationship history (if we had relationship tracking)
    // This could be enhanced with actual relationship history

    return Math.min(score, 1.0)
  }

  private loadBondTemplates(): void {
    // This would typically load from a data file
    // For now, we'll define some basic templates
    this.bondTemplates = [
      {
        id: 'mentor-student',
        name: 'Mentor & Student',
        description: 'I am teaching {target} the ways of my class',
        characterClasses: ['Fighter', 'Wizard', 'Cleric', 'Thief'],
        targetClasses: ['Fighter', 'Wizard', 'Cleric', 'Thief'],
        alignmentPreferences: ['Good', 'Neutral'],
        tags: ['mentorship', 'learning'],
        xpTrigger: 'When {target} successfully uses a move I taught them',
      },
      {
        id: 'rivalry',
        name: 'Rivalry',
        description: 'I am competing with {target} to prove my superiority',
        characterClasses: ['Fighter', 'Thief', 'Wizard'],
        targetClasses: ['Fighter', 'Thief', 'Wizard'],
        alignmentPreferences: ['Chaotic', 'Neutral'],
        tags: ['competition', 'conflict'],
        xpTrigger: 'When I best {target} in a direct challenge',
      },
      {
        id: 'protective',
        name: 'Protective',
        description: 'I will protect {target} from harm',
        characterClasses: ['Fighter', 'Cleric', 'Paladin'],
        targetClasses: ['Wizard', 'Thief', 'Cleric'],
        alignmentPreferences: ['Good', 'Lawful'],
        tags: ['protection', 'care'],
        xpTrigger: 'When I successfully protect {target} from danger',
      },
      {
        id: 'mysterious',
        name: 'Mysterious Past',
        description: '{target} and I share a mysterious connection from our past',
        characterClasses: ['Thief', 'Wizard', 'Fighter'],
        targetClasses: ['Thief', 'Wizard', 'Fighter'],
        alignmentPreferences: ['Chaotic', 'Neutral'],
        tags: ['mystery', 'history'],
        xpTrigger: 'When we discover something about our shared past',
      },
    ]
  }
}

export const bondService = BondService.getInstance()
