/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface HudSliderTrackVariant {
  /**
 * @default "classic"
 */
theme: "classic" | "cosmic" | "moebius"
}

type HudSliderTrackVariantMap = {
  [key in keyof HudSliderTrackVariant]: Array<HudSliderTrackVariant[key]>
}



export type HudSliderTrackVariantProps = {
  [key in keyof HudSliderTrackVariant]?: ConditionalValue<HudSliderTrackVariant[key]> | undefined
}

export interface HudSliderTrackRecipe {
  
  __type: HudSliderTrackVariantProps
  (props?: HudSliderTrackVariantProps): string
  raw: (props?: HudSliderTrackVariantProps) => HudSliderTrackVariantProps
  variantMap: HudSliderTrackVariantMap
  variantKeys: Array<keyof HudSliderTrackVariant>
  splitVariantProps<Props extends HudSliderTrackVariantProps>(props: Props): [HudSliderTrackVariantProps, Pretty<DistributiveOmit<Props, keyof HudSliderTrackVariantProps>>]
  getVariantProps: (props?: HudSliderTrackVariantProps) => HudSliderTrackVariantProps
}

/**
 * Space-HUD slider track
 */
export declare const hudSliderTrack: HudSliderTrackRecipe