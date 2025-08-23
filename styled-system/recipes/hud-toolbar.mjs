import { memo, splitProps } from '../helpers.mjs';
import { createRecipe, mergeRecipes } from './create-recipe.mjs';

const hudToolbarFn = /* @__PURE__ */ createRecipe('hud-toolbar', {
  "orientation": "horizontal",
  "theme": "classic"
}, [])

const hudToolbarVariantMap = {
  "orientation": [
    "horizontal",
    "vertical"
  ],
  "theme": [
    "classic",
    "cosmic",
    "moebius"
  ]
}

const hudToolbarVariantKeys = Object.keys(hudToolbarVariantMap)

export const hudToolbar = /* @__PURE__ */ Object.assign(memo(hudToolbarFn.recipeFn), {
  __recipe__: true,
  __name__: 'hudToolbar',
  __getCompoundVariantCss__: hudToolbarFn.__getCompoundVariantCss__,
  raw: (props) => props,
  variantKeys: hudToolbarVariantKeys,
  variantMap: hudToolbarVariantMap,
  merge(recipe) {
    return mergeRecipes(this, recipe)
  },
  splitVariantProps(props) {
    return splitProps(props, hudToolbarVariantKeys)
  },
  getVariantProps: hudToolbarFn.getVariantProps,
})