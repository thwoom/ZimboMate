// PERFORMANCE: 3D Dice completely removed - using simple 2D dice instead
// Original 3D dice were causing major performance issues
// The 2D DiceRoller.tsx provides the same functionality with better performance

export interface Dice3DResult {
  dice1: number
  dice2: number
  total: number
  modifier: number
  finalResult: number
  outcome: 'success' | 'partial' | 'failure'
  rollDuration: number
  timestamp: number
}

export interface Dice3DProps {
  modifier?: number
  disabled?: boolean
  enablePhysics?: boolean
  enableShadows?: boolean
  theme?: 'fantasy' | 'sci-fi' | 'dark' | 'light'
  onRoll?: (result: Dice3DResult) => void
  onRollStart?: () => void
}

export const Dice3D: React.FC<Dice3DProps> = () => {
  return null // Removed for performance - use DiceRoller.tsx instead
}