const shortener = require('./shortener');

beforeAll(async () => {
  await shortener.init();
});

test('shorten an url', async () => {
  const url = 'https://example.com';
  const short = await shortener.shorten(url);

  expect(short).toBeDefined();
});

test('shorten an url with desired shortcode', async () => {
  const url = 'https://example.com/myurl';
  const short = await shortener.shorten(url, 'myurl');

  expect(short).toBe('myurl');
});

test('shorten same url generate same short code', async () => {
  const url = 'https://example2.com';
  const short = await shortener.shorten(url);
  const short2 = await shortener.shorten(url);
  expect(short).toBe(short2);
});

test('get short url', async () => {
  const url = 'https://example3.com';
  const short = await shortener.shorten(url);
  const data = await shortener.get(short);

  expect(data.url).toBe(url);
});

test('get short url with stats', async () => {
  const url = 'https://example4.com';
  const short = await shortener.shorten(url);
  const data = await shortener.get(short, true);

  expect(data.url).toBe(url);
  expect(data.stats).toBe('0');
});

test('increment short url stats', async () => {
  const url = 'https://example5.com';
  const short = await shortener.shorten(url);
  await shortener.resetStats(short);
  await shortener.increment(short);
  const data = await shortener.get(short, true);

  expect(data.stats).toBe('1');
});

test('create a secure key/value to securize a short url stats', async () => {
  await shortener.registerSecret('foo', 'bar');
  const url = 'https://example10.com';
  const short = await shortener.shorten(url, 'securized', 'foo');

  // data.stats is not provided if the secure key is not provided
  let data = await shortener.get(short, true);
  expect(data.stats).toBeUndefined();

  // if wrong secure secret is provided, the stats are not provided
  data = await shortener.get(short, true, 'wrong');
  expect(data.stats).toBeUndefined();

  // if the correct secure secret is provided, the stats are provided
  data = await shortener.get(short, true, 'bar');
  expect(data.stats).toBeDefined();
});

afterAll(async () => {
  await shortener.client.disconnect();
});