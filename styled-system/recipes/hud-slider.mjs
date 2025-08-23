import { memo, splitProps } from '../helpers.mjs';
import { createRecipe, mergeRecipes } from './create-recipe.mjs';

const hudSliderFn = /* @__PURE__ */ createRecipe('hud-slider', {
  "orientation": "horizontal",
  "theme": "classic"
}, [])

const hudSliderVariantMap = {
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

const hudSliderVariantKeys = Object.keys(hudSliderVariantMap)

export const hudSlider = /* @__PURE__ */ Object.assign(memo(hudSliderFn.recipeFn), {
  __recipe__: true,
  __name__: 'hudSlider',
  __getCompoundVariantCss__: hudSliderFn.__getCompoundVariantCss__,
  raw: (props) => props,
  variantKeys: hudSliderVariantKeys,
  variantMap: hudSliderVariantMap,
  merge(recipe) {
    return mergeRecipes(this, recipe)
  },
  splitVariantProps(props) {
    return splitProps(props, hudSliderVariantKeys)
  },
  getVariantProps: hudSliderFn.getVariantProps,
})