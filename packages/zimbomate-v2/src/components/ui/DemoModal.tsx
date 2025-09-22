import React, { Suspense, lazy } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Maximize2, Minimize2 } from 'lucide-react'
import { Button, Card, CardContent } from './index'

// Lazy load demo components
const Enhanced3DDiceDemo = lazy(() => import('../../App.Enhanced3DDice'))
const HooksDemoApp = lazy(() => import('../../App.HooksDemo'))
const DemoIndexApp = lazy(() => import('../../App.DemoIndex'))
const Dice3DApp = lazy(() => import('../../App.Dice3D'))

interface DemoModalProps {
  isOpen: boolean
  onClose: () => void
  demoId: string | null
  demoTitle?: string
}

const demoComponents: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'enhanced-3d-dice': Enhanced3DDiceDemo,
  'hooks-demo': HooksDemoApp,
  'demo-index': DemoIndexApp,
  'dice-3d': Dice3DApp,
}

const demoTitles: Record<string, string> = {
  'enhanced-3d-dice': 'Enhanced 3D Dice System',
  'hooks-demo': 'Custom Hooks System',
  'demo-index': 'Demo Showcase',
  'dice-3d': '3D Dice Rolling',
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  demoId,
  demoTitle
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  
  const DemoComponent = demoId ? demoComponents[demoId] : null
  const title = demoTitle || (demoId ? demoTitles[demoId] : 'Demo')

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const openInNewTab = () => {
    if (demoId) {
      // Create a data URL with the demo component
      const demoUrl = `data:text/html,<html><head><title>${title}</title></head><body><div id="root"></div><script>console.log('Demo: ${demoId}')</script></body></html>`
      window.open(demoUrl, '_blank')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
        </Dialog.Overlay>
        
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed z-50 bg-(--color-background) rounded-lg shadow-2xl border border-(--color-border) ${
              isFullscreen 
                ? 'inset-4' 
                : 'top-[5%] left-[5%] right-[5%] bottom-[5%] max-w-7xl mx-auto'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-(--color-border) bg-(--color-surface) rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-(--nature-500)" />
                <Dialog.Title className="font-display font-bold text-(--color-text-primary)">
                  {title}
                </Dialog.Title>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openInNewTab}
                  className="p-2"
                  title="Open in new tab"
                >
                  <ExternalLink size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="p-2"
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </Button>
                <Dialog.Close asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    title="Close demo"
                  >
                    <X size={16} />
                  </Button>
                </Dialog.Close>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden">
              {DemoComponent ? (
                <div className="h-full overflow-auto">
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                      <Card variant="outline" padding="lg">
                        <CardContent className="text-center space-y-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 border-2 border-(--color-primary) border-t-transparent rounded-full mx-auto"
                          />
                          <div>
                            <h3 className="font-medium text-(--color-text-primary) mb-1">
                              Loading Demo
                            </h3>
                            <p className="text-sm text-(--color-text-secondary)">
                              Preparing {title}...
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  }>
                    <div className="demo-container">
                      <DemoComponent />
                    </div>
                  </Suspense>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Card variant="outline" padding="lg">
                    <CardContent className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-(--color-surface-elevated) rounded-full flex items-center justify-center">
                        <X size={32} className="text-(--color-text-muted)" />
                      </div>
                      <div>
                        <h3 className="font-medium text-(--color-text-primary) mb-1">
                          Demo Not Found
                        </h3>
                        <p className="text-sm text-(--color-text-secondary)">
                          The requested demo could not be loaded.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}