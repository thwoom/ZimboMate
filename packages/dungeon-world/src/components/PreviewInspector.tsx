import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Meter } from './ui/Meter'
import { Button } from './ui/Button'
import { usePreviewStore } from './PreviewProvider'

export function PreviewInspector() {
  const { character, updateCharacter, setRollResult } = usePreviewStore()

  const xpThreshold = character.level + 7
  const getModifier = (score: number) => Math.floor((score - 10) / 2)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Inspector
        </h2>
      </div>

      {/* Character Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Character Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Name:</span>
              <span className="text-text-primary font-medium">{character.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Class:</span>
              <span className="text-text-primary">{character.class}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Level:</span>
              <span className="text-text-primary">{character.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Alignment:</span>
              <span className="text-text-primary">{character.alignment}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Meter
              label="Hit Points"
              current={character.hp.current}
              max={character.hp.max}
              variant="hp"
              showValues={true}
              showPercentage={true}
            />
            
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-text-secondary">Status:</span>
                <span className={`font-medium ${
                  character.hp.current <= 0 ? 'text-danger' :
                  character.hp.current <= character.hp.max * 0.25 ? 'text-warning' :
                  'text-success'
                }`}>
                  {character.hp.current <= 0 ? 'Unconscious' :
                   character.hp.current <= character.hp.max * 0.25 ? 'Critical' :
                   character.hp.current <= character.hp.max * 0.5 ? 'Injured' :
                   'Healthy'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Experience Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Meter
              label="Experience Points"
              current={character.xp}
              max={xpThreshold}
              variant="xp"
              showValues={true}
              showPercentage={true}
            />
            
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Next Level:</span>
                <span className="text-text-primary">
                  {xpThreshold - character.xp} XP needed
                </span>
              </div>
            </div>
            
            {character.xp >= xpThreshold && (
              <Button variant="success" size="sm" className="w-full">
                Level Up Available!
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attribute Details */}
      <Card>
        <CardHeader>
          <CardTitle>Attribute Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(character.attributes).map(([attr, score]) => {
              const modifier = getModifier(score)
              return (
                <div key={attr} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary w-8">
                      {attr}
                    </span>
                    <span className="text-sm text-text-secondary">
                      ({score})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono ${
                      modifier >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      {modifier >= 0 ? '+' : ''}{modifier}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="xs"
                      onClick={() => {
                        const roll1 = Math.floor(Math.random() * 6) + 1
                        const roll2 = Math.floor(Math.random() * 6) + 1
                        const total = roll1 + roll2 + modifier
                        setRollResult(`${attr}: ${roll1} + ${roll2} + ${modifier} = ${total}`)
                      }}
                    >
                      Roll
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Debilities */}
      {Object.values(character.debilities || {}).some(Boolean) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-warning">Active Debilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(character.debilities || {}).map(([debility, active]) => {
                if (!active) return null
                return (
                  <div key={debility} className="flex items-center justify-between">
                    <span className="text-sm text-text-primary capitalize">
                      {debility}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="xs"
                      onClick={() => {
                        updateCharacter({
                          debilities: {
                            ...character.debilities,
                            [debility]: false
                          }
                        })
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}