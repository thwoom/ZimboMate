import type { ColorVariant } from '../../types/enums'
import * as Tooltip from '@radix-ui/react-tooltip'
import React from 'react'

interface ColorSwatchProps {
  variant: ColorVariant
  shade: string
  value: string
  name: string
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({ variant, shade, value, name }) => {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div className="group cursor-pointer">
          <div
            className="w-16 h-16 rounded-lg border-2 shadow-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg"
            style={{
              backgroundColor: `var(--${variant}-${shade})`,
              borderColor: 'var(--popover)',
            }}
          />
          <div className="mt-2 text-center">
            <div className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{shade}</div>
            <div className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-ui)' }}>{name}</div>
          </div>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="px-3 py-2 text-sm rounded-md shadow-lg backdrop-blur-sm"
          style={{
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'var(--card)',
            borderColor: 'var(--primary)',
          }}
          sideOffset={5}
        >
          <div>
            <div className="font-semibold">{name}</div>
            <div className="text-muted-foreground">
              --
              {variant}
              -
              {shade}
            </div>
            <div className="text-muted-foreground">{value}</div>
          </div>
          <Tooltip.Arrow className="fill-[color:var(--card)]" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

interface ColorPaletteProps {
  variant: ColorVariant
  title: string
  colors: Array<{ shade: string, value: string, name: string }>
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ variant, title, colors }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-display-sm">{title}</h3>
      <div className="grid grid-cols-5 gap-4">
        {colors.map(color => (
          <ColorSwatch
            key={color.shade}
            variant={variant}
            shade={color.shade}
            value={color.value}
            name={color.name}
          />
        ))}
      </div>
    </div>
  )
}
