// Mock data for 3D dice rolling system
export const mockDice3DProps = {
  modifier: 2,
  disabled: false,
  enablePhysics: true,
  enableShadows: true,
  cameraPosition: [0, 5, 10] as const,
  lightingIntensity: 1.2,
  diceSize: 1.0,
  tableHeight: -2,
  rollForce: 8,
  rollTorque: 12,
  settleThreshold: 0.1,
  maxRollTime: 5000,
  theme: 'fantasy' as const
};

export const mockDiceResult = {
  dice1: 4,
  dice2: 3,
  total: 7,
  modifier: 2,
  finalResult: 9,
  outcome: 'partial' as const,
  rollDuration: 2.3,
  timestamp: Date.now()
};

export const mockPhysicsSettings = {
  gravity: -9.81,
  restitution: 0.4,
  friction: 0.6,
  linearDamping: 0.4,
  angularDamping: 0.4,
  tableRestitution: 0.3,
  tableFriction: 0.8
};