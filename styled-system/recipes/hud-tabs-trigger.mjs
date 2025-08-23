import { memo, splitProps } from '../helpers.mjs';
import { createRecipe, mergeRecipes } from './create-recipe.mjs';

const hudTabsTriggerFn = /* @__PURE__ */ createRecipe('hud-tabs-trigger', {
  "state": "inactive",
  "theme": "classic"
}, [])

const hudTabsTriggerVariantMap = {
  "state": [
    "inactive",
    "active"
  ],
  "theme": [
    "classic",
    "cosmic",
    "moebius"
  ]
}

const hudTabsTriggerVariantKeys = Object.keys(hudTabsTriggerVariantMap)

export const hudTabsTrigger = /* @__PURE__ */ Object.assign(memo(hudTabsTriggerFn.recipeFn), {
  __recipe__: true,
  __name__: 'hudTabsTrigger',
  __getCompoundVariantCss__: hudTabsTriggerFn.__getCompoundVariantCss__,
  raw: (props) => props,
  variantKeys: hudTabsTriggerVariantKeys,
  variantMap: hudTabsTriggerVariantMap,
  merge(recipe) {
    return mergeRecipes(this, recipe)
  },
  splitVariantProps(props) {
    return splitProps(props, hudTabsTriggerVariantKeys)
  },
  getVariantProps: hudTabsTriggerFn.getVariantProps,
})