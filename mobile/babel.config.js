module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["transform-inline-environment-variables", { include: ["API_URL"] }],
      "react-native-reanimated/plugin",
    ],
  };
};
