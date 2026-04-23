const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support path aliases via babel-plugin-module-resolver
config.resolver.sourceExts = [...config.resolver.sourceExts];

module.exports = config;
