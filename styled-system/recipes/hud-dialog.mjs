import { memo, splitProps } from '../helpers.mjs';
import { createRecipe, mergeRecipes } from './create-recipe.mjs';

const hudDialogFn = /* @__PURE__ */ createRecipe('hud-dialog', {
  "theme": "classic",
  "size": "md"
}, [])

const hudDialogVariantMap = {
  "theme": [
    "classic",
    "cosmic",
    "moebius"
  ],
  "size": [
    "sm",
    "md",
    "lg",
    "xl"
  ]
}

const hudDialogVariantKeys = Object.keys(hudDialogVariantMap)

export const hudDialog = /* @__PURE__ */ Object.assign(memo(hudDialogFn.recipeFn), {
  __recipe__: true,
  __name__: 'hudDialog',
  __getCompoundVariantCss__: hudDialogFn.__getCompoundVariantCss__,
  raw: (props) => props,
  variantKeys: hudDialogVariantKeys,
  variantMap: hudDialogVariantMap,
  merge(recipe) {
    return mergeRecipes(this, recipe)
  },
  splitVariantProps(props) {
    return splitProps(props, hudDialogVariantKeys)
  },
  getVariantProps: hudDialogFn.getVariantProps,
})