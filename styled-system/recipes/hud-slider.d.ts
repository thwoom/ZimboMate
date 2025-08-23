/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface HudSliderVariant {
  /**
 * @default "horizontal"
 */
orientation: "horizontal" | "vertical"
/**
 * @default "classic"
 */
theme: "classic" | "cosmic" | "moebius"
}

type HudSliderVariantMap = {
  [key in keyof HudSliderVariant]: Array<HudSliderVariant[key]>
}



export type HudSliderVariantProps = {
  [key in keyof HudSliderVariant]?: ConditionalValue<HudSliderVariant[key]> | undefined
}

export interface HudSliderRecipe {
  
  __type: HudSliderVariantProps
  (props?: HudSliderVariantProps): string
  raw: (props?: HudSliderVariantProps) => HudSliderVariantProps
  variantMap: HudSliderVariantMap
  variantKeys: Array<keyof HudSliderVariant>
  splitVariantProps<Props extends HudSliderVariantProps>(props: Props): [HudSliderVariantProps, Pretty<DistributiveOmit<Props, keyof HudSliderVariantProps>>]
  getVariantProps: (props?: HudSliderVariantProps) => HudSliderVariantProps
}

/**
 * Space-HUD slider component
 */
export declare const hudSlider: HudSliderRecipe