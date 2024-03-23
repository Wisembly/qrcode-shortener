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
const SHORTENER_SECRET_KEY = `${prefix}:secret:%s`;

const SHORTENER_SECRETS = `${prefix}:secret:%s`;

const shortener = {
  client: null,

  async init () {
    this.client = await storage.connect();
  },

  async shorten(url, desiredShort = null, secureKey = null) {
    const short = desiredShort || generateShort();

    const shortKey = SHORTENER_KEY.replace('%s', short);
    const reverseKey = SHORTENER_REVERSE_KEY.replace('%s', url);

    if (await this.exists(reverseKey))
      return await this.client.get(reverseKey);

    if (await this.exists(shortKey))
      return await this.shorten(url, null, secureKey);

    const promises = [
      this.client.set(shortKey, url),
      this.client.set(reverseKey, short),
      this.client.set(SHORTENER_COUNT_KEY.replace('%s', short), 0)
    ];

    if (secureKey)
      promises.push(this.client.set(SHORTENER_SECRET_KEY.replace('%s', short), secureKey));

    await Promise.all(promises);

    return short;
  },

  async get(short, withStats = false, secret = null) {
    const shortKey = SHORTENER_KEY.replace('%s', short);

    if (!await this.exists(shortKey))
      return null;

    const data = {};

    data.url = await this.client.get(shortKey);

    if (withStats) {
      const isSecured = await this.isSecured(short);
      const isSecure = isSecured ? await this.isSecure(short, secret) : false;

      if (!await this.isSecured(short) || await this.isSecure(short, secret))
        data.stats = await this.client.get(SHORTENER_COUNT_KEY.replace('%s', short));
    }

    return data;
  },

  async increment(short) {
    return await this.client.incr(SHORTENER_COUNT_KEY.replace('%s', short));
  },

  async resetStats(short) {
    return await this.client.set(SHORTENER_COUNT_KEY.replace('%s', short), 0);
  },

  async registerSecret(key, secret) {
    const redisKey = SHORTENER_SECRETS.replace('%s', key);

    // if key already exists, do not replace it
    if (await this.client.exists(redisKey))
      return false;

    return await this.client.set(redisKey, secret);
  },

  async isSecured(short) {
    return !!await this.client.exists(SHORTENER_SECRET_KEY.replace('%s', short));
  },

  async isSecure(short, secret) {
    // retrieve the secret key used to secure the short url
    const secretKey = await this.client.get(SHORTENER_SECRET_KEY.replace('%s', short));

    // retrieve secretKey secret
    const storedSecret = await this.client.get(SHORTENER_SECRETS.replace('%s', secretKey));

    console.log(secretKey, storedSecret, secret);

    return storedSecret === secret;
  },

  async exists (short) {
    return await this.client.exists(short);
  }
};

module.exports = shortener;