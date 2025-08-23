/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface HudPillVariant {
  /**
 * @default "default"
 */
variant: "default" | "success" | "warning" | "destructive"
/**
 * @default "classic"
 */
theme: "classic" | "cosmic" | "moebius"
}

type HudPillVariantMap = {
  [key in keyof HudPillVariant]: Array<HudPillVariant[key]>
}



export type HudPillVariantProps = {
  [key in keyof HudPillVariant]?: ConditionalValue<HudPillVariant[key]> | undefined
}

export interface HudPillRecipe {
  
  __type: HudPillVariantProps
  (props?: HudPillVariantProps): string
  raw: (props?: HudPillVariantProps) => HudPillVariantProps
  variantMap: HudPillVariantMap
  variantKeys: Array<keyof HudPillVariant>
  splitVariantProps<Props extends HudPillVariantProps>(props: Props): [HudPillVariantProps, Pretty<DistributiveOmit<Props, keyof HudPillVariantProps>>]
  getVariantProps: (props?: HudPillVariantProps) => HudPillVariantProps
}

/**
 * HUD pill component for status indicators
 */
export declare const hudPill: HudPillRecipe