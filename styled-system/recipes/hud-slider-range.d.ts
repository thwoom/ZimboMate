/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface HudSliderRangeVariant {
  /**
 * @default "classic"
 */
theme: "classic" | "cosmic" | "moebius"
}

type HudSliderRangeVariantMap = {
  [key in keyof HudSliderRangeVariant]: Array<HudSliderRangeVariant[key]>
}



export type HudSliderRangeVariantProps = {
  [key in keyof HudSliderRangeVariant]?: ConditionalValue<HudSliderRangeVariant[key]> | undefined
}

export interface HudSliderRangeRecipe {
  
  __type: HudSliderRangeVariantProps
  (props?: HudSliderRangeVariantProps): string
  raw: (props?: HudSliderRangeVariantProps) => HudSliderRangeVariantProps
  variantMap: HudSliderRangeVariantMap
  variantKeys: Array<keyof HudSliderRangeVariant>
  splitVariantProps<Props extends HudSliderRangeVariantProps>(props: Props): [HudSliderRangeVariantProps, Pretty<DistributiveOmit<Props, keyof HudSliderRangeVariantProps>>]
  getVariantProps: (props?: HudSliderRangeVariantProps) => HudSliderRangeVariantProps
}

/**
 * Space-HUD slider range
 */
export declare const hudSliderRange: HudSliderRangeRecipe