import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { hudSlider, hudSliderTrack, hudSliderRange, hudSliderThumb } from 'styled-system/recipes'
import { cn, getCurrentTheme, getAugmentedUIClasses } from '@/lib/theme-utils'

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    React.ComponentProps<typeof hudSlider> {
  theme?: 'classic' | 'cosmic' | 'moebius'
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, orientation, ...props }, ref) => {
  const theme = getCurrentTheme()
  const augClasses = getAugmentedUIClasses(theme, 'slider')
  
  return (
    <SliderPrimitive.Root
      ref={ref}
      orientation={orientation}
      className={cn(
        hudSlider({ theme, orientation }),
        augClasses,
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          hudSliderTrack({ theme })
        )}
      >
        <SliderPrimitive.Range 
          className={cn(
            hudSliderRange({ theme })
          )} 
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb 
        className={cn(
          hudSliderThumb({ theme })
        )} 
      />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
