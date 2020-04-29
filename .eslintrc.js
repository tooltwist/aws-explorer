module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  // add your custom rules here
  rules: {

    // Added by Phil, 22nd March 2020
    "no-console": "off",
    "array-bracket-spacing": "off", // Allow [ ]
    "vue/html-self-closing": "off",
    "prefer-const": "off",
    "curly": "off",
    "semi": "off",
    "arrow-parens": "off",
    "eqeqeq": "off",
    "no-multiple-empty-lines": "off",
    "space-before-function-paren": "off",
    "no-var": "off",
    "comma-spacing": "off",
    "padded-blocks": "off",
    "dot-notation": "off",
    "spaced-comment": "off",
    "indent": "off",
    "quotes": "off",
    "no-unused-vars": "off",
    "quotes": "off",
    "vue/order-in-components": "off",
    "object-shorthand": "off",
    "one-var": "off",
    "import/order": "off",
    "no-tabs": "off",
    "handle-callback-err": "off",
    "camelcase": "off",
    "brace-style": "off",
    "space-unary-ops": "off",
    "comma-dangle": "off",
    "unicorn/prefer-includes": "off",
    "vue/name-property-casing": "off",
    "space-in-params" : "off",
    "object-curly-spacing": "off",
    "require-await": "off",
    "vue/require-prop-types": "off",
    "quote-props": "off",
    "no-trailing-spaces": "off",
    "space-infix-ops": "off",
    "unicorn/no-new-buffer": "off",
    "node/no-deprecated-api": "off",
    "no-undef": "off",
    "standard/no-callback-literal": "off",
    "no-mixed-spaces-and-tabs": "off",
    "no-path-concat": "off",
    "space-in-parens": "off",
    "no-useless-return": "off",
    "space-before-blocks": "off",
    "vue/require-default-prop": "off",
    "quotes": "off",
    "quotes": "off",
    "quotes": "off",
    "quotes": "off",
  }
}
