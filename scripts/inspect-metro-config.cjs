const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname + "/..");
console.log(JSON.stringify({ hasCacheStores: Object.prototype.hasOwnProperty.call(config, "cacheStores"), cacheStores: config.cacheStores, resolver: Object.keys(config.resolver || {}) }, null, 2));
