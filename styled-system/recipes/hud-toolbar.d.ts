/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface HudToolbarVariant {
  /**
 * @default "horizontal"
 */
orientation: "horizontal" | "vertical"
/**
 * @default "classic"
 */
theme: "classic" | "cosmic" | "moebius"
}

type HudToolbarVariantMap = {
  [key in keyof HudToolbarVariant]: Array<HudToolbarVariant[key]>
}



export type HudToolbarVariantProps = {
  [key in keyof HudToolbarVariant]?: ConditionalValue<HudToolbarVariant[key]> | undefined
}

export interface HudToolbarRecipe {
  
  __type: HudToolbarVariantProps
  (props?: HudToolbarVariantProps): string
  raw: (props?: HudToolbarVariantProps) => HudToolbarVariantProps
  variantMap: HudToolbarVariantMap
  variantKeys: Array<keyof HudToolbarVariant>
  splitVariantProps<Props extends HudToolbarVariantProps>(props: Props): [HudToolbarVariantProps, Pretty<DistributiveOmit<Props, keyof HudToolbarVariantProps>>]
  getVariantProps: (props?: HudToolbarVariantProps) => HudToolbarVariantProps
}

/**
 * Space-HUD toolbar component
 */
export declare const hudToolbar: HudToolbarRecipe