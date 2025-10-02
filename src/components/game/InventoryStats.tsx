import type { Character } from '../../models/Character'
import type { InventoryStats as IInventoryStats } from '../../models/Inventory'
import { motion } from 'framer-motion'
import {
  Coins,
  Gem,
  Package,
  Shield,
  Sword,
  TrendingUp,
  Weight,
  Wine,
} from 'lucide-react'
import React from 'react'
import { formatValue, formatWeight } from '../../equipmentSystemMockData'
import { Badge, Card, CardContent, CardHeader, CardTitle, Progress } from '../ui'

interface InventoryStatsProps {
  stats: IInventoryStats
  character: Character
}

const categoryIcons = {
  equipped: Sword,
  carried: Package,
  stored: Package,
  consumables: Wine,
  treasure: Gem,
  other: Package,
}

const categoryColors = {
  equipped: 'text-(--gold-600)',
  carried: 'text-(--parchment-700)',
  stored: 'text-(--parchment-600)',
  consumables: 'text-(--nature-600)',
  treasure: 'text-(--gold-500)',
  other: 'text-(--parchment-500)',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({
  stats,
  character,
}) => {
  const weightPercentage = (stats.totalWeight / character.load.max) * 100

  const getEncumbranceColor = (percentage: number) => {
    if (percentage > 100)
      return 'text-(--danger-600)'
    if (percentage > 80)
      return 'text-(--gold-600)'
    return 'text-(--nature-600)'
  }

  const getEncumbranceBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return { variant: 'success' as const, label: 'Normal' }
      case 'encumbered':
        return { variant: 'warning' as const, label: 'Encumbered' }
      case 'overloaded':
        return { variant: 'destructive' as const, label: 'Overloaded' }
      default:
        return { variant: 'secondary' as const, label: 'Unknown' }
    }
  }

  const encumbranceBadge = getEncumbranceBadge(stats.encumbranceStatus)

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Overview Stats */}
      <motion.div variants={cardVariants}>
        <Card variant="magical">
          <CardHeader>
            <CardTitle className="text-xl font-display text-(--parchment-900) flex items-center gap-2">
              <TrendingUp size={20} className="text-(--parchment-800)" />
              Inventory Overview
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Weight */}
              <div className="text-center p-4 bg-(--parchment-100) rounded-lg border border-(--parchment-300)">
                <Weight size={24} className={`mx-auto mb-2 ${getEncumbranceColor(weightPercentage)}`} />
                <div className="space-y-1">
                  <p className="text-lg font-bold text-(--parchment-900) font-mono">
                    {formatWeight(stats.totalWeight)}
                  </p>
                  <p className="text-xs text-(--parchment-600) font-ui">
                    Total Weight
                  </p>
                  <Badge variant={encumbranceBadge.variant} className="text-xs">
                    {encumbranceBadge.label}
                  </Badge>
                </div>
              </div>

              {/* Total Value */}
              <div className="text-center p-4 bg-(--parchment-100) rounded-lg border border-(--parchment-300)">
                <Coins size={24} className="mx-auto mb-2 text-(--gold-600)" />
                <div className="space-y-1">
                  <p className="text-lg font-bold text-(--parchment-900) font-mono">
                    {formatValue(stats.totalValue)}
                  </p>
                  <p className="text-xs text-(--parchment-600) font-ui">
                    Total Value
                  </p>
                </div>
              </div>

              {/* Item Count */}
              <div className="text-center p-4 bg-(--parchment-100) rounded-lg border border-(--parchment-300)">
                <Package size={24} className="mx-auto mb-2 text-(--parchment-700)" />
                <div className="space-y-1">
                  <p className="text-lg font-bold text-(--parchment-900) font-mono">
                    {stats.itemCount}
                  </p>
                  <p className="text-xs text-(--parchment-600) font-ui">
                    Total Items
                  </p>
                </div>
              </div>

              {/* Load Capacity */}
              <div className="text-center p-4 bg-(--parchment-100) rounded-lg border border-(--parchment-300)">
                <div className="mb-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-(--parchment-200) flex items-center justify-center">
                    <span className={`text-sm font-bold font-mono ${getEncumbranceColor(weightPercentage)}`}>
                      {Math.round(weightPercentage)}
                      %
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-(--parchment-900) font-mono">
                    {stats.totalWeight}
                    {' '}
                    /
                    {character.load.max}
                  </p>
                  <p className="text-xs text-(--parchment-600) font-ui">
                    Load Capacity
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weight Distribution */}
      <motion.div variants={cardVariants}>
        <Card variant="parchment">
          <CardHeader>
            <CardTitle className="text-lg font-display text-(--parchment-900) flex items-center gap-2">
              <Weight size={18} className="text-(--parchment-800)" />
              Weight Distribution
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.weightByCategory)
                .filter(([_, weight]) => weight > 0)
                .sort(([_, a], [__, b]) => b - a)
                .map(([category, weight]) => {
                  const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons]
                  const percentage = stats.totalWeight > 0 ? (weight / stats.totalWeight) * 100 : 0

                  return (
                    <motion.div
                      key={category}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <CategoryIcon
                        size={16}
                        className={categoryColors[category as keyof typeof categoryColors]}
                      />

                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-(--parchment-900) capitalize font-ui">
                            {category}
                          </span>
                          <span className="text-sm text-(--parchment-700) font-mono">
                            {formatWeight(weight)}
                            {' '}
                            (
                            {percentage.toFixed(1)}
                            %)
                          </span>
                        </div>

                        <div className="w-full bg-(--parchment-200) rounded-full h-2">
                          <motion.div
                            className="h-2 rounded-full bg-gradient-to-r from-(--parchment-500) to-(--parchment-600)"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Load Capacity Visualization */}
      <motion.div variants={cardVariants}>
        <Card variant="surface">
          <CardHeader>
            <CardTitle className="text-lg font-display text-(--parchment-900) flex items-center gap-2">
              <Shield size={18} className="text-(--parchment-800)" />
              Load Capacity Analysis
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-(--parchment-700) font-ui">
                  Current Load
                </span>
                <span className="text-sm font-bold text-(--parchment-900) font-mono">
                  {formatWeight(stats.totalWeight)}
                </span>
              </div>

              <Progress
                variant="default"
                fillVariant={weightPercentage > 100 ? 'health-critical' : weightPercentage > 80 ? 'health-injured' : 'health'}
                value={stats.totalWeight}
                max={character.load.max}
                showLabel={false}
              />

              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <div className="w-3 h-3 bg-(--nature-500) rounded-full mx-auto mb-1" />
                  <span className="text-(--parchment-600) font-ui">Normal</span>
                  <p className="font-mono text-(--parchment-800)">
                    0 -
                    {' '}
                    {character.load.max}
                    {' '}
                    lbs
                  </p>
                </div>
                <div>
                  <div className="w-3 h-3 bg-(--gold-500) rounded-full mx-auto mb-1" />
                  <span className="text-(--parchment-600) font-ui">Encumbered</span>
                  <p className="font-mono text-(--parchment-800)">
                    {character.load.max + 1}
                    {' '}
                    -
                    {character.load.max + 2}
                    {' '}
                    lbs
                  </p>
                </div>
                <div>
                  <div className="w-3 h-3 bg-(--danger-500) rounded-full mx-auto mb-1" />
                  <span className="text-(--parchment-600) font-ui">Overloaded</span>
                  <p className="font-mono text-(--parchment-800)">
                    {character.load.max + 3}
                    + lbs
                  </p>
                </div>
              </div>

              {stats.encumbranceStatus !== 'normal' && (
                <motion.div
                  className="text-xs text-(--parchment-700) bg-(--parchment-100) rounded-md p-3 border-l-2 border-(--gold-400)"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.3 }}
                >
                  {stats.encumbranceStatus === 'encumbered' && (
                    <p>
                      <strong>Encumbered:</strong>
                      {' '}
                      You take -1 ongoing to all rolls until you lighten your load.
                    </p>
                  )}
                  {stats.encumbranceStatus === 'overloaded' && (
                    <p>
                      <strong>Overloaded:</strong>
                      {' '}
                      You can barely move. Drop items or find another way to reduce your load.
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
