const storage = require('./storage');

const generateShort = (size = 4) => {
  const letters = `ABCDEFGHJKLMNPRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789`.split('');

  let short = '';

  for (let i = 0; i < size; i++)
    short += letters[Math.floor(Math.random() * letters.length)];

  return short;
};

const prefix = process.env.REDIS_PREFIX || 'shortener';

const SHORTENER_KEY = `${prefix}:%s`;
const SHORTENER_REVERSE_KEY = `${prefix}:reverse:%s`;
const SHORTENER_COUNT_KEY = `${prefix}:count:%s`;

const shortener = {
  client: null,

  async init () {
    this.client = await storage.connect();
  },

  async shorten(url, desiredShort = null) {
    const short = desiredShort || generateShort();

    const shortKey = SHORTENER_KEY.replace('%s', short);
    const reverseKey = SHORTENER_REVERSE_KEY.replace('%s', url);

    if (await this.exists(reverseKey))
      return await this.client.get(reverseKey);

    if (await this.exists(shortKey))
      return await this.shorten(url);

    await Promise.all([
      this.client.set(shortKey, url),
      this.client.set(reverseKey, short),
      this.client.set(SHORTENER_COUNT_KEY.replace('%s', short), 0)
    ]);

    return short;
  },

  async get(short, withStats = false) {
    const shortKey = SHORTENER_KEY.replace('%s', short);

    if (!await this.exists(shortKey))
      return null;

    const data = {};

    data.url = await this.client.get(shortKey);

    if (withStats)
      data.stats = await this.client.get(SHORTENER_COUNT_KEY.replace('%s', short));

    return data;
  },

  async increment(short) {
    return await this.client.incr(SHORTENER_COUNT_KEY.replace('%s', short));
  },

  async exists (short) {
    return await this.client.exists(short);
  }
};

module.exports = shortener;