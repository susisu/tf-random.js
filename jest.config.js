/* eslint-env node */
/* eslint-disable strict */

"use strict";

module.exports = {
  collectCoverage    : true,
  collectCoverageFrom: ["lib/**/*.js", "!**/*.test.js"],
  testEnvironment    : "node",
};
