import { memo, splitProps } from '../helpers.mjs';
import { createRecipe, mergeRecipes } from './create-recipe.mjs';

const hudPanelFn = /* @__PURE__ */ createRecipe('hud-panel', {
  "theme": "classic",
  "size": "md"
}, [])

const hudPanelVariantMap = {
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

const hudPanelVariantKeys = Object.keys(hudPanelVariantMap)

export const hudPanel = /* @__PURE__ */ Object.assign(memo(hudPanelFn.recipeFn), {
  __recipe__: true,
  __name__: 'hudPanel',
  __getCompoundVariantCss__: hudPanelFn.__getCompoundVariantCss__,
  raw: (props) => props,
  variantKeys: hudPanelVariantKeys,
  variantMap: hudPanelVariantMap,
  merge(recipe) {
    return mergeRecipes(this, recipe)
  },
  splitVariantProps(props) {
    return splitProps(props, hudPanelVariantKeys)
  },
  getVariantProps: hudPanelFn.getVariantProps,
})