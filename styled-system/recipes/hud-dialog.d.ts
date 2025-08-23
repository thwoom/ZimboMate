/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface HudDialogVariant {
  /**
 * @default "classic"
 */
theme: "classic" | "cosmic" | "moebius"
/**
 * @default "md"
 */
size: "sm" | "md" | "lg" | "xl"
}

type HudDialogVariantMap = {
  [key in keyof HudDialogVariant]: Array<HudDialogVariant[key]>
}



export type HudDialogVariantProps = {
  [key in keyof HudDialogVariant]?: ConditionalValue<HudDialogVariant[key]> | undefined
}

export interface HudDialogRecipe {
  
  __type: HudDialogVariantProps
  (props?: HudDialogVariantProps): string
  raw: (props?: HudDialogVariantProps) => HudDialogVariantProps
  variantMap: HudDialogVariantMap
  variantKeys: Array<keyof HudDialogVariant>
  splitVariantProps<Props extends HudDialogVariantProps>(props: Props): [HudDialogVariantProps, Pretty<DistributiveOmit<Props, keyof HudDialogVariantProps>>]
  getVariantProps: (props?: HudDialogVariantProps) => HudDialogVariantProps
}

/**
 * Space-HUD dialog component
 */
export declare const hudDialog: HudDialogRecipe