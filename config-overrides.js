/*
 * config-overrides.js
 * Same approach as cure-plus-fe: CRA is customized through react-app-rewired
 * instead of ejecting. Here we only need antd v3 modular imports.
 */
const { override, fixBabelImports } = require("customize-cra");

module.exports = override(
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: "css",
  })
);
