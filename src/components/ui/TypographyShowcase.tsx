import React from 'react'

export const TypographyShowcase: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-md mb-4">Typography System</h2>
        <p className="text-body text-muted-foreground">
          Demonstrating the magical typography hierarchy for ZimboMate V2
        </p>
      </div>

      {/* Display Typography */}
      <div className="space-y-4">
        <h3 className="text-display-sm">Display Typography</h3>
        <div className="space-y-3 p-6 rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm">
          <h1 className="text-display-lg">The Ancient Tome of Adventures</h1>
          <h2 className="text-display-md">Chapter: The Goblin King's Lair</h2>
          <h3 className="text-display-sm">Section: The Final Battle</h3>
        </div>
      </div>

      {/* Body Typography */}
      <div className="space-y-4">
        <h3 className="text-display-sm">Body Typography</h3>
        <div className="space-y-4 p-6 rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm">
          <p className="text-body-lg">
            <strong>Large Body Text:</strong> The ancient dragon stirred in its slumber, 
            golden scales catching the flickering torchlight as our heroes approached 
            the treasure chamber.
          </p>
          <p className="text-body">
            <strong>Regular Body Text:</strong> Your party stands at the threshold of destiny. 
            The air crackles with magical energy, and the very stones seem to whisper 
            secrets of ages past.
          </p>
          <p className="text-body-sm">
            <strong>Small Body Text:</strong> Roll 2d6 + STR to attempt breaking down 
            the enchanted door. On a 10+, you succeed magnificently.
          </p>
        </div>
      </div>

      {/* UI Typography */}
      <div className="space-y-4">
        <h3 className="text-display-sm">UI Typography</h3>
        <div className="space-y-4 p-6 rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm">
          <div className="text-ui">
            <strong>UI Text:</strong> Character Sheet • Equipment • Spells
          </div>
          <div className="text-ui-sm">
            <strong>Small UI Text:</strong> HP: 25/30 • XP: 1,250 • Level 3
          </div>
        </div>
      </div>

      {/* Font Families */}
      <div className="space-y-4">
        <h3 className="text-display-sm">Font Families</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm">
            <h4 className="font-display text-xl mb-3">Cinzel Display</h4>
            <p className="font-display">The Enchanted Realm Awaits</p>
            <p className="text-sm text-muted-foreground mt-2">Used for headings and magical titles</p>
          </div>
          
          <div className="p-6 rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm">
            <h4 className="font-body text-xl mb-3">Crimson Text Body</h4>
            <p className="font-body">Readable text for long passages and storytelling</p>
            <p className="text-sm text-muted-foreground mt-2">Used for body text and descriptions</p>
          </div>
          
          <div className="p-6 rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm">
            <h4 className="font-ui text-xl mb-3">Inter UI</h4>
            <p className="font-ui">Clean interface elements and controls</p>
            <p className="text-sm text-muted-foreground mt-2">Used for UI elements and buttons</p>
          </div>
          
          <div className="p-6 rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm">
            <h4 className="font-mono text-xl mb-3">JetBrains Mono</h4>
            <p className="font-mono">STR: 16 (+2) • DEX: 14 (+1)</p>
            <p className="text-sm text-muted-foreground mt-2">Used for stats and code</p>
          </div>
        </div>
      </div>
    </div>
  )
}