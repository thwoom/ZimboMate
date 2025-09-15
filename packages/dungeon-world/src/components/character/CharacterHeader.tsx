import React from 'react'
import { Card, CardContent } from '../ui/Card'
import { cn } from '../../lib/utils'

export interface CharacterHeaderProps {
  name: string
  characterClass: string
  level: number
  alignment: string
  className?: string
}

export function CharacterHeader({
  name,
  characterClass,
  level,
  alignment,
  className
}: CharacterHeaderProps) {
  return (
    <Card className={cn('mb-6', className)}>
      <CardContent className="p-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">
            {name}
          </h1>
          <div className="flex items-center justify-center gap-6 text-lg">
            <span className="text-primary font-semibold">
              {characterClass}
            </span>
            <span className="text-text-secondary">
              Level {level}
            </span>
            <span className="text-warning italic">
              {alignment}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}