import React from 'react'
import { motion } from 'framer-motion'
import { Progress, Badge } from '../ui'
import { EncumbranceStatus } from '../../models/Inventory'
import { formatLoadStatus } from '../../equipmentSystemMockData'
import { Weight, AlertTriangle, CheckCircle } from 'lucide-react'

interface LoadTrackerProps {
  currentLoad: number
  maxLoad: number
  encumbranceStatus: EncumbranceStatus
}

export const LoadTracker: React.FC<LoadTrackerProps> = ({
  currentLoad,
  maxLoad,
  encumbranceStatus
}) => {
  const percentage = Math.min((currentLoad / maxLoad) * 100, 120) // Cap at 120% for overloaded
  
  const getStatusColor = (status: EncumbranceStatus) => {
    switch (status) {
      case 'normal':
        return 'success'
      case 'encumbered':
        return 'warning'
      case 'overloaded':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: EncumbranceStatus) => {
    switch (status) {
      case 'normal':
        return CheckCircle
      case 'encumbered':
      case 'overloaded':
        return AlertTriangle
      default:
        return Weight
    }
  }

  const StatusIcon = getStatusIcon(encumbranceStatus)
  const statusColor = getStatusColor(encumbranceStatus)

  // Determine progress variant based on load
  let progressVariant: 'default' | 'health' | 'health-injured' | 'health-critical' = 'default'
  if (percentage > 100) {
    progressVariant = 'health-critical'
  } else if (percentage > 80) {
    progressVariant = 'health-injured'
  } else {
    progressVariant = 'health'
  }

  return (
    <motion.div 
      className="load-tracker space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Weight size={16} className="text-(--parchment-700)" />
          <span className="text-sm font-medium text-(--parchment-900) font-ui">
            Load Capacity
          </span>
        </div>
        
        <motion.div
          key={encumbranceStatus}
          initial={{ scale: 1.2, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Badge variant={statusColor} className="flex items-center gap-1">
            <StatusIcon size={12} />
            {formatLoadStatus(currentLoad, maxLoad)}
          </Badge>
        </motion.div>
      </div>

      <div className="space-y-2">
        <Progress
          variant="default"
          fillVariant={progressVariant}
          value={currentLoad}
          max={maxLoad}
          showLabel={false}
        />
        
        <div className="flex justify-between items-center text-xs text-(--parchment-600) font-mono">
          <span>
            {currentLoad} / {maxLoad} lbs
          </span>
          <span>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Encumbrance Effects */}
      {encumbranceStatus !== 'normal' && (
        <motion.div
          className="text-xs text-(--parchment-700) bg-(--parchment-100) rounded-md p-2 border-l-2 border-(--gold-400)"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.3 }}
        >
          {encumbranceStatus === 'encumbered' && (
            <p>
              <strong>Encumbered:</strong> You take -1 ongoing to all rolls until you lighten your load.
            </p>
          )}
          {encumbranceStatus === 'overloaded' && (
            <p>
              <strong>Overloaded:</strong> You can barely move. Drop items or find another way to reduce your load.
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}