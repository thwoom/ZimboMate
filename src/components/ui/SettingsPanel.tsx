import React from 'react'
import { Card, CardContent } from './index'

export const SettingsPanel: React.FC = () => (
  <Card>
    <CardContent className="space-y-3">
      <div className="font-semibold">Settings</div>
      <p className="text-sm text-muted-foreground">
        Chronicle features have been removed. Configure theme and keyboard shortcuts in their respective tabs.
      </p>
    </CardContent>
  </Card>
)

export default SettingsPanel
