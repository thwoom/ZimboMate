/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface HudSliderThumbVariant {
  /**
 * @default "classic"
 */
theme: "classic" | "cosmic" | "moebius"
}

type HudSliderThumbVariantMap = {
  [key in keyof HudSliderThumbVariant]: Array<HudSliderThumbVariant[key]>
}



export type HudSliderThumbVariantProps = {
  [key in keyof HudSliderThumbVariant]?: ConditionalValue<HudSliderThumbVariant[key]> | undefined
}

export interface HudSliderThumbRecipe {
  
  __type: HudSliderThumbVariantProps
  (props?: HudSliderThumbVariantProps): string
  raw: (props?: HudSliderThumbVariantProps) => HudSliderThumbVariantProps
  variantMap: HudSliderThumbVariantMap
  variantKeys: Array<keyof HudSliderThumbVariant>
  splitVariantProps<Props extends HudSliderThumbVariantProps>(props: Props): [HudSliderThumbVariantProps, Pretty<DistributiveOmit<Props, keyof HudSliderThumbVariantProps>>]
  getVariantProps: (props?: HudSliderThumbVariantProps) => HudSliderThumbVariantProps
}

/**
 * Space-HUD slider thumb
 */
export declare const hudSliderThumb: HudSliderThumbRecipe