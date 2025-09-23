import React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Play, Settings, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, Badge } from './index'

export interface DemoInfo {
  id: string
  title: string
  description: string
  status: 'complete' | 'in-progress' | 'planned'
  category: 'core' | 'game' | 'ui' | 'system'
  features: string[]
  techStack: string[]
  lastUpdated: string
  component: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

interface DemoCardProps {
  demo: DemoInfo
  onNavigate: (demoId: string) => void
  className?: string
}

const statusConfig = {
  complete: {
    icon: CheckCircle,
    color: 'text-(--nature-500)',
    bgColor: 'bg-(--nature-500)/10',
    borderColor: 'border-(--nature-500)/20',
    label: 'Complete'
  },
  'in-progress': {
    icon: Clock,
    color: 'text-(--gold-500)',
    bgColor: 'bg-(--gold-500)/10',
    borderColor: 'border-(--gold-500)/20',
    label: 'In Progress'
  },
  planned: {
    icon: AlertCircle,
    color: 'text-(--parchment-500)',
    bgColor: 'bg-(--parchment-500)/10',
    borderColor: 'border-(--parchment-500)/20',
    label: 'Planned'
  }
}

const categoryConfig = {
  core: {
    color: 'text-(--magic-500)',
    bgColor: 'bg-(--magic-500)/10',
    label: 'Core System'
  },
  game: {
    color: 'text-(--gold-500)',
    bgColor: 'bg-(--gold-500)/10',
    label: 'Game Features'
  },
  ui: {
    color: 'text-(--nature-500)',
    bgColor: 'bg-(--nature-500)/10',
    label: 'UI Components'
  },
  system: {
    color: 'text-(--cyber-500)',
    bgColor: 'bg-(--cyber-500)/10',
    label: 'System Demo'
  }
}

export const DemoCard: React.FC<DemoCardProps> = ({ demo, onNavigate, className = '' }) => {
  const statusInfo = statusConfig[demo.status]
  const categoryInfo = categoryConfig[demo.category]
  const StatusIcon = statusInfo.icon
  const DemoIcon = demo.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card
        variant="magical"
        className={`h-full cursor-pointer group hover:shadow-lg transition-all duration-300 ${statusInfo.borderColor}`}
        onClick={() => onNavigate(demo.id)}
      >
        <CardContent className="space-y-4 p-6 pt-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${categoryInfo.bgColor}`}>
                <DemoIcon size={24} className={categoryInfo.color} />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {demo.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`text-xs ${categoryInfo.color} ${categoryInfo.bgColor}`}>
                    {categoryInfo.label}
                  </Badge>
                  <div className={`flex items-center gap-1 text-xs ${statusInfo.color}`}>
                    <StatusIcon size={12} />
                    {statusInfo.label}
                  </div>
                </div>
              </div>
            </div>
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.1 }}
            >
              <ExternalLink size={16} className="text-muted-foreground" />
            </motion.div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed">
            {demo.description}
          </p>

          {/* Features */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Key Features
            </h4>
            <div className="flex flex-wrap gap-1">
              {demo.features.slice(0, 4).map((feature, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-1"
                >
                  {feature}
                </Badge>
              ))}
              {demo.features.length > 4 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{demo.features.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Tech Stack
            </h4>
            <div className="flex flex-wrap gap-1">
              {demo.techStack.slice(0, 3).map((tech, index) => (
                <span 
                  key={index}
                  className="text-xs px-2 py-1 bg-popover text-muted-foreground rounded"
                >
                  {tech}
                </span>
              ))}
              {demo.techStack.length > 3 && (
                <span className="text-xs px-2 py-1 bg-popover text-muted-foreground rounded">
                  +{demo.techStack.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Updated {demo.lastUpdated}
            </span>
            <motion.div
              className="flex items-center gap-1 text-xs text-primary font-medium"
              whileHover={{ x: 2 }}
            >
              <Play size={12} />
              Launch Demo
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}