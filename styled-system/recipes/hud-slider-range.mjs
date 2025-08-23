import { memo, splitProps } from '../helpers.mjs';
import { createRecipe, mergeRecipes } from './create-recipe.mjs';

const hudSliderRangeFn = /* @__PURE__ */ createRecipe('hud-slider-range', {
  "theme": "classic"
}, [])

const hudSliderRangeVariantMap = {
  "theme": [
    "classic",
    "cosmic",
    "moebius"
  ]
}

const hudSliderRangeVariantKeys = Object.keys(hudSliderRangeVariantMap)

export const hudSliderRange = /* @__PURE__ */ Object.assign(memo(hudSliderRangeFn.recipeFn), {
  __recipe__: true,
  __name__: 'hudSliderRange',
  __getCompoundVariantCss__: hudSliderRangeFn.__getCompoundVariantCss__,
  raw: (props) => props,
  variantKeys: hudSliderRangeVariantKeys,
  variantMap: hudSliderRangeVariantMap,
  merge(recipe) {
    return mergeRecipes(this, recipe)
  },
  splitVariantProps(props) {
    return splitProps(props, hudSliderRangeVariantKeys)
  },
  getVariantProps: hudSliderRangeFn.getVariantProps,
})