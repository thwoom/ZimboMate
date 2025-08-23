/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface HudToggleVariant {
  /**
 * @default "unchecked"
 */
state: "unchecked" | "checked"
/**
 * @default "classic"
 */
theme: "classic" | "cosmic" | "moebius"
}

type HudToggleVariantMap = {
  [key in keyof HudToggleVariant]: Array<HudToggleVariant[key]>
}



export type HudToggleVariantProps = {
  [key in keyof HudToggleVariant]?: ConditionalValue<HudToggleVariant[key]> | undefined
}

export interface HudToggleRecipe {
  
  __type: HudToggleVariantProps
  (props?: HudToggleVariantProps): string
  raw: (props?: HudToggleVariantProps) => HudToggleVariantProps
  variantMap: HudToggleVariantMap
  variantKeys: Array<keyof HudToggleVariant>
  splitVariantProps<Props extends HudToggleVariantProps>(props: Props): [HudToggleVariantProps, Pretty<DistributiveOmit<Props, keyof HudToggleVariantProps>>]
  getVariantProps: (props?: HudToggleVariantProps) => HudToggleVariantProps
}

/**
 * Space-HUD toggle switch component
 */
export declare const hudToggle: HudToggleRecipe