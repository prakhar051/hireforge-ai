const IORedis = require("ioredis");

let connection;

if (process.env.REDIS_URL) {
  // ✅ Cloud Redis (Upstash / Railway / etc.)
  connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
} else {
  // ✅ Local Redis (Docker / local install)
  connection = new IORedis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
  });
}

module.exports = connection;