module.exports = {
  root: true,
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module"
  },
  extends: [
    "standard",
    "eslint:recommended",
    "plugin:vue/essential",
    "plugin:prettier/recommended"
  ],
  plugins: ["html"],
  env: {
    node: true,
    browser: true,
  },
  // add your custom rules here
  "rules": {
    "no-unused-vars": 0,
    "arrow-parens": 0,
    "generator-star-spacing": 0,
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0,
    "comma-dangle": ["error", "always-multiline"],
    "space-before-function-paren": 0,
    "no-trailing-spaces": 0
  }
}
