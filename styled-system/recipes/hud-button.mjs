import { memo, splitProps } from '../helpers.mjs';
import { createRecipe, mergeRecipes } from './create-recipe.mjs';

const hudButtonFn = /* @__PURE__ */ createRecipe('hud-button', {
  "variant": "primary",
  "theme": "classic",
  "size": "md"
}, [])

const hudButtonVariantMap = {
  "variant": [
    "primary",
    "secondary",
    "destructive",
    "outline",
    "ghost"
  ],
  "theme": [
    "classic",
    "cosmic",
    "moebius"
  ],
  "size": [
    "sm",
    "md",
    "lg"
  ]
}

const hudButtonVariantKeys = Object.keys(hudButtonVariantMap)

export const hudButton = /* @__PURE__ */ Object.assign(memo(hudButtonFn.recipeFn), {
  __recipe__: true,
  __name__: 'hudButton',
  __getCompoundVariantCss__: hudButtonFn.__getCompoundVariantCss__,
  raw: (props) => props,
  variantKeys: hudButtonVariantKeys,
  variantMap: hudButtonVariantMap,
  merge(recipe) {
    return mergeRecipes(this, recipe)
  },
  splitVariantProps(props) {
    return splitProps(props, hudButtonVariantKeys)
  },
  getVariantProps: hudButtonFn.getVariantProps,
})