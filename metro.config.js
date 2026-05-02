const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');

config.transformer = {
  ...config.transformer,
  enableBabelRuntime: true,
};

module.exports = config;
