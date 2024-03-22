const { createClient } = require('redis');

const storage = {
  client: null,

  async connect() {
    this.client = await createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    });

    await this.client.connect();

    console.log('Connected to Redis');

    return this.client;
  },

  async disconnect() {
    await this.client.disconnect();
  },

  async get(key) {
    return this.client.get(key);
  },

  async set(key, value) {
    return this.client.set(key, value);
  },

  async del(key) {
    return this.client.del(key);
  },

  async incr(key) {
    return this.client.incr(key);
  },
};

module.exports = storage;