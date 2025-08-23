import { memo, splitProps } from '../helpers.mjs';
import { createRecipe, mergeRecipes } from './create-recipe.mjs';

const hudTabsFn = /* @__PURE__ */ createRecipe('hud-tabs', {
  "orientation": "horizontal",
  "theme": "classic"
}, [])

const hudTabsVariantMap = {
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

const hudTabsVariantKeys = Object.keys(hudTabsVariantMap)

export const hudTabs = /* @__PURE__ */ Object.assign(memo(hudTabsFn.recipeFn), {
  __recipe__: true,
  __name__: 'hudTabs',
  __getCompoundVariantCss__: hudTabsFn.__getCompoundVariantCss__,
  raw: (props) => props,
  variantKeys: hudTabsVariantKeys,
  variantMap: hudTabsVariantMap,
  merge(recipe) {
    return mergeRecipes(this, recipe)
  },
  splitVariantProps(props) {
    return splitProps(props, hudTabsVariantKeys)
  },
  getVariantProps: hudTabsFn.getVariantProps,
})