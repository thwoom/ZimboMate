import { memo, splitProps } from '../helpers.mjs';
import { createRecipe, mergeRecipes } from './create-recipe.mjs';

const hudSliderThumbFn = /* @__PURE__ */ createRecipe('hud-slider-thumb', {
  "theme": "classic"
}, [])

const hudSliderThumbVariantMap = {
  "theme": [
    "classic",
    "cosmic",
    "moebius"
  ]
}

const hudSliderThumbVariantKeys = Object.keys(hudSliderThumbVariantMap)

export const hudSliderThumb = /* @__PURE__ */ Object.assign(memo(hudSliderThumbFn.recipeFn), {
  __recipe__: true,
  __name__: 'hudSliderThumb',
  __getCompoundVariantCss__: hudSliderThumbFn.__getCompoundVariantCss__,
  raw: (props) => props,
  variantKeys: hudSliderThumbVariantKeys,
  variantMap: hudSliderThumbVariantMap,
  merge(recipe) {
    return mergeRecipes(this, recipe)
  },
  splitVariantProps(props) {
    return splitProps(props, hudSliderThumbVariantKeys)
  },
  getVariantProps: hudSliderThumbFn.getVariantProps,
})