/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface HudButtonVariant {
  /**
 * @default "primary"
 */
variant: "primary" | "secondary" | "destructive" | "outline" | "ghost"
/**
 * @default "classic"
 */
theme: "classic" | "cosmic" | "moebius"
/**
 * @default "md"
 */
size: "sm" | "md" | "lg"
}

type HudButtonVariantMap = {
  [key in keyof HudButtonVariant]: Array<HudButtonVariant[key]>
}



export type HudButtonVariantProps = {
  [key in keyof HudButtonVariant]?: ConditionalValue<HudButtonVariant[key]> | undefined
}

export interface HudButtonRecipe {
  
  __type: HudButtonVariantProps
  (props?: HudButtonVariantProps): string
  raw: (props?: HudButtonVariantProps) => HudButtonVariantProps
  variantMap: HudButtonVariantMap
  variantKeys: Array<keyof HudButtonVariant>
  splitVariantProps<Props extends HudButtonVariantProps>(props: Props): [HudButtonVariantProps, Pretty<DistributiveOmit<Props, keyof HudButtonVariantProps>>]
  getVariantProps: (props?: HudButtonVariantProps) => HudButtonVariantProps
}

/**
 * Space-HUD button with theme variants
 */
export declare const hudButton: HudButtonRecipe