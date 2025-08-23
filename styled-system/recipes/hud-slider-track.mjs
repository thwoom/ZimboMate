import { memo, splitProps } from '../helpers.mjs';
import { createRecipe, mergeRecipes } from './create-recipe.mjs';

const hudSliderTrackFn = /* @__PURE__ */ createRecipe('hud-slider-track', {
  "theme": "classic"
}, [])

const hudSliderTrackVariantMap = {
  "theme": [
    "classic",
    "cosmic",
    "moebius"
  ]
}

const hudSliderTrackVariantKeys = Object.keys(hudSliderTrackVariantMap)

export const hudSliderTrack = /* @__PURE__ */ Object.assign(memo(hudSliderTrackFn.recipeFn), {
  __recipe__: true,
  __name__: 'hudSliderTrack',
  __getCompoundVariantCss__: hudSliderTrackFn.__getCompoundVariantCss__,
  raw: (props) => props,
  variantKeys: hudSliderTrackVariantKeys,
  variantMap: hudSliderTrackVariantMap,
  merge(recipe) {
    return mergeRecipes(this, recipe)
  },
  splitVariantProps(props) {
    return splitProps(props, hudSliderTrackVariantKeys)
  },
  getVariantProps: hudSliderTrackFn.getVariantProps,
})