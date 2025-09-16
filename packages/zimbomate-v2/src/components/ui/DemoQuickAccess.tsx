import React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Grid, Play, Sparkles, Code, Gamepad2 } from 'lucide-react'
import { Card, CardContent, Button, Badge } from './index'

interface QuickDemo {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  status: 'new' | 'updated' | 'stable'
  url: string
}

const quickDemos: QuickDemo[] = [
  {
    id: 'enhanced-3d-dice',
    title: 'Enhanced 3D Dice',
    description: 'Latest 3D dice with physics & audio',
    icon: Play,
    status: 'new',
    url: '#enhanced-3d-dice'
  },
  {
    id: 'hooks-system',
    title: 'Hooks System',
    description: 'All 13 custom React hooks',
    icon: Code,
    status: 'stable',
    url: '#hooks-demo'
  },
  {
    id: 'complete-app',
    title: 'Full App Demo',
    description: 'Complete Dungeon World companion',
    icon: Gamepad2,
    status: 'stable',
    url: '#complete-app'
  }
]

const statusConfig = {
  new: {
    color: 'text-(--nature-500)',
    bgColor: 'bg-(--nature-500)/10',
    label: 'New'
  },
  updated: {
    color: 'text-(--gold-500)',
    bgColor: 'bg-(--gold-500)/10',
    label: 'Updated'
  },
  stable: {
    color: 'text-(--cyber-500)',
    bgColor: 'bg-(--cyber-500)/10',
    label: 'Stable'
  }
}

interface DemoQuickAccessProps {
  onDemoNavigate?: (demoId: string, demoTitle: string) => void
}

export const DemoQuickAccess: React.FC<DemoQuickAccessProps> = ({ onDemoNavigate }) => {
  const handleOpenDemoIndex = () => {
    if (onDemoNavigate) {
      onDemoNavigate('demo-index', 'Demo Showcase')
    }
  }

  const handleDemoClick = (demo: QuickDemo) => {
    if (onDemoNavigate) {
      onDemoNavigate(demo.id, demo.title)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Grid className="w-5 h-5 text-(--color-primary)" />
          <h3 className="text-lg font-display font-bold text-(--color-text-primary)">
            Demo Showcase
          </h3>
        </div>
        <p className="text-sm text-(--color-text-secondary) max-w-sm mx-auto">
          Quick access to interactive demos and component showcases
        </p>
      </div>

      {/* Quick Demo Cards */}
      <div className="grid grid-cols-1 gap-3">
        {quickDemos.map((demo, index) => {
          const Icon = demo.icon
          const statusInfo = statusConfig[demo.status]
          
          return (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                variant="outline" 
                padding="sm" 
                className="cursor-pointer group hover:shadow-md transition-all duration-200 hover:border-(--color-primary)/30"
                onClick={() => handleDemoClick(demo)}
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <div className={`p-2 rounded-lg ${statusInfo.bgColor} group-hover:scale-110 transition-transform`}>
                    <Icon size={16} className={statusInfo.color} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-(--color-text-primary) truncate">
                        {demo.title}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-1.5 py-0.5 ${statusInfo.color} ${statusInfo.bgColor}`}
                      >
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-(--color-text-secondary) truncate">
                      {demo.description}
                    </p>
                  </div>
                  
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                  >
                    <ExternalLink size={14} className="text-(--color-text-muted)" />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* View All Demos Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenDemoIndex}
          className="w-full flex items-center justify-center gap-2 group"
        >
          <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
          View All Demos
          <ExternalLink size={14} />
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="text-center"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-(--color-primary)">11</div>
            <div className="text-xs text-(--color-text-muted)">Total Demos</div>
          </div>
          <div>
            <div className="text-lg font-bold text-(--nature-500)">9</div>
            <div className="text-xs text-(--color-text-muted)">Complete</div>
          </div>
          <div>
            <div className="text-lg font-bold text-(--gold-500)">4</div>
            <div className="text-xs text-(--color-text-muted)">Categories</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}