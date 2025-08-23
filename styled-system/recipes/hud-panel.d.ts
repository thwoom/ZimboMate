/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface HudPanelVariant {
  /**
 * @default "classic"
 */
theme: "classic" | "cosmic" | "moebius"
/**
 * @default "md"
 */
size: "sm" | "md" | "lg"
}

type HudPanelVariantMap = {
  [key in keyof HudPanelVariant]: Array<HudPanelVariant[key]>
}



export type HudPanelVariantProps = {
  [key in keyof HudPanelVariant]?: ConditionalValue<HudPanelVariant[key]> | undefined
}

export interface HudPanelRecipe {
  
  __type: HudPanelVariantProps
  (props?: HudPanelVariantProps): string
  raw: (props?: HudPanelVariantProps) => HudPanelVariantProps
  variantMap: HudPanelVariantMap
  variantKeys: Array<keyof HudPanelVariant>
  splitVariantProps<Props extends HudPanelVariantProps>(props: Props): [HudPanelVariantProps, Pretty<DistributiveOmit<Props, keyof HudPanelVariantProps>>]
  getVariantProps: (props?: HudPanelVariantProps) => HudPanelVariantProps
}

/**
 * Space-HUD panel component with theme variants
 */
export declare const hudPanel: HudPanelRecipe