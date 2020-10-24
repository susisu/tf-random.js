"use strict";

module.exports = {
  plugins: ["prettier"],
  overrides: [
    {
      files: ["*.js"],
      extends: [
        "@susisu/eslint-config/preset/es",
        "plugin:eslint-comments/recommended",
        "prettier",
      ],
      parserOptions: {
        ecmaVersion: 2019,
        sourceType: "script",
      },
      env: {
        es6: true,
        node: true,
      },
      rules: {
        "prettier/prettier": "error",
        "eslint-comments/no-unused-disable": "error",
      },
    },
    {
      files: ["rollup.config.js"],
      parserOptions: {
        sourceType: "module",
      },
    },
    {
      files: ["lib/**/*.js"],
      parserOptions: {
        sourceType: "module",
      },
      env: {
        node: false,
      },
    },
    {
      files: ["lib/**/*.{test,spec}.js", "lib/**/__tests__/**/*.js"],
      extends: ["plugin:jest/recommended", "plugin:jest-formatting/recommended"],
      env: {
        "jest/globals": true,
      },
    },
  ],
};
