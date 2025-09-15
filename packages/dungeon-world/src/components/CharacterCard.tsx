import React from 'react'

interface CharacterCardProps {
  name: string
  characterClass: string
  level: number
  alignment: string
  portraitUrl: string
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  name,
  characterClass,
  level,
  alignment,
  portraitUrl
}) => {
  return (
    <div className="glass-panel rounded-xl p-6 mb-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <img
            src={portraitUrl}
            alt={`${name} portrait`}
            className="w-20 h-20 rounded-full object-cover ring-2 ring-white/20"
          />
          <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {level}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white mb-1">{name}</h1>
          <p className="text-lg text-white/80 mb-1">Level {level} {characterClass}</p>
          <p className="text-sm text-white/60">{alignment}</p>
        </div>
      </div>
    </div>
  )
}

export default CharacterCard