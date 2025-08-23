import { memo, splitProps } from '../helpers.mjs';
import { createRecipe, mergeRecipes } from './create-recipe.mjs';

const hudToggleFn = /* @__PURE__ */ createRecipe('hud-toggle', {
  "state": "unchecked",
  "theme": "classic"
}, [])

const hudToggleVariantMap = {
  "state": [
    "unchecked",
    "checked"
  ],
  "theme": [
    "classic",
    "cosmic",
    "moebius"
  ]
}

const hudToggleVariantKeys = Object.keys(hudToggleVariantMap)

export const hudToggle = /* @__PURE__ */ Object.assign(memo(hudToggleFn.recipeFn), {
  __recipe__: true,
  __name__: 'hudToggle',
  __getCompoundVariantCss__: hudToggleFn.__getCompoundVariantCss__,
  raw: (props) => props,
  variantKeys: hudToggleVariantKeys,
  variantMap: hudToggleVariantMap,
  merge(recipe) {
    return mergeRecipes(this, recipe)
  },
  splitVariantProps(props) {
    return splitProps(props, hudToggleVariantKeys)
  },
  getVariantProps: hudToggleFn.getVariantProps,
})