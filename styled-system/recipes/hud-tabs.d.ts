/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface HudTabsVariant {
  /**
 * @default "horizontal"
 */
orientation: "horizontal" | "vertical"
/**
 * @default "classic"
 */
theme: "classic" | "cosmic" | "moebius"
}

type HudTabsVariantMap = {
  [key in keyof HudTabsVariant]: Array<HudTabsVariant[key]>
}



export type HudTabsVariantProps = {
  [key in keyof HudTabsVariant]?: ConditionalValue<HudTabsVariant[key]> | undefined
}

export interface HudTabsRecipe {
  
  __type: HudTabsVariantProps
  (props?: HudTabsVariantProps): string
  raw: (props?: HudTabsVariantProps) => HudTabsVariantProps
  variantMap: HudTabsVariantMap
  variantKeys: Array<keyof HudTabsVariant>
  splitVariantProps<Props extends HudTabsVariantProps>(props: Props): [HudTabsVariantProps, Pretty<DistributiveOmit<Props, keyof HudTabsVariantProps>>]
  getVariantProps: (props?: HudTabsVariantProps) => HudTabsVariantProps
}

/**
 * Space-HUD tabs component
 */
export declare const hudTabs: HudTabsRecipe