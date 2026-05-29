const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

const getCacheKey = (data) => {
  return JSON.stringify(data);
};

module.exports = { cache, getCacheKey };