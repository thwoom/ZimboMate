import { memo, splitProps } from '../helpers.mjs';
import { createRecipe, mergeRecipes } from './create-recipe.mjs';

const hudPillFn = /* @__PURE__ */ createRecipe('hud-pill', {
  "variant": "default",
  "theme": "classic"
}, [])

const hudPillVariantMap = {
  "variant": [
    "default",
    "success",
    "warning",
    "destructive"
  ],
  "theme": [
    "classic",
    "cosmic",
    "moebius"
  ]
}

const hudPillVariantKeys = Object.keys(hudPillVariantMap)

export const hudPill = /* @__PURE__ */ Object.assign(memo(hudPillFn.recipeFn), {
  __recipe__: true,
  __name__: 'hudPill',
  __getCompoundVariantCss__: hudPillFn.__getCompoundVariantCss__,
  raw: (props) => props,
  variantKeys: hudPillVariantKeys,
  variantMap: hudPillVariantMap,
  merge(recipe) {
    return mergeRecipes(this, recipe)
  },
  splitVariantProps(props) {
    return splitProps(props, hudPillVariantKeys)
  },
  getVariantProps: hudPillFn.getVariantProps,
})