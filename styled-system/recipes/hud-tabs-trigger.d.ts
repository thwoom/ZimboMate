/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface HudTabsTriggerVariant {
  /**
 * @default "inactive"
 */
state: "inactive" | "active"
/**
 * @default "classic"
 */
theme: "classic" | "cosmic" | "moebius"
}

type HudTabsTriggerVariantMap = {
  [key in keyof HudTabsTriggerVariant]: Array<HudTabsTriggerVariant[key]>
}



export type HudTabsTriggerVariantProps = {
  [key in keyof HudTabsTriggerVariant]?: ConditionalValue<HudTabsTriggerVariant[key]> | undefined
}

export interface HudTabsTriggerRecipe {
  
  __type: HudTabsTriggerVariantProps
  (props?: HudTabsTriggerVariantProps): string
  raw: (props?: HudTabsTriggerVariantProps) => HudTabsTriggerVariantProps
  variantMap: HudTabsTriggerVariantMap
  variantKeys: Array<keyof HudTabsTriggerVariant>
  splitVariantProps<Props extends HudTabsTriggerVariantProps>(props: Props): [HudTabsTriggerVariantProps, Pretty<DistributiveOmit<Props, keyof HudTabsTriggerVariantProps>>]
  getVariantProps: (props?: HudTabsTriggerVariantProps) => HudTabsTriggerVariantProps
}

/**
 * Space-HUD tabs trigger
 */
export declare const hudTabsTrigger: HudTabsTriggerRecipe