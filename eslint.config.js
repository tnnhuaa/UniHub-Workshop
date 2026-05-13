module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "apps/api/dist/**",
      "apps/api/scripts/**",
      "**/coverage/**",
      "**/docs/**",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: require("@babel/eslint-parser"),
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          parserOpts: {
            plugins: ["jsx", "typescript"],
          },
        },
      },
    },
    plugins: {
      prettier: require("eslint-plugin-prettier"),
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
];
