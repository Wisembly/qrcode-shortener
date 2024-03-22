const express = require('express');
const cors = require('cors');
const PassThrough = require('stream').PassThrough;

const app = express();
const port = process.env.PORT || 3001;
const domain = process.env.DOMAIN || `http://localhost:${port}`;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const QRCode = require('qrcode');
const shortener = require('./shortener');
shortener.init();

// logs
app.use(function (req, res, next) {
  console.log(`[${(new Date()).toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send({ hello: 'world' });
});

app.get('/qrcode', async (req, res) => {
  const { url, quality, size, output, desiredShort } = req.query;

  if (!url)
    return res.status(400).send({ error: 'url query parameter is required' });

  const short = await shortener.shorten(url, desiredShort);

  let shortUrl = `${domain}/${short}`;

  try {
    if (output === 'data') {
      const qr = await QRCode.toDataURL(shortUrl, {
        errorCorrectionLevel: quality || 'M',
      });

      return res.send({ qr });
    }

    const qrStream = new PassThrough();
    await QRCode.toFileStream(qrStream, shortUrl, {
      errorCorrectionLevel: quality || 'M',
      width: size || 512,
    });

    res.setHeader('Content-Type', 'image/png');
    qrStream.pipe(res);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// route every /* url
app.get('/:short', async (req, res) => {
  let { short } = req.params;
  let showStats = false;

  // if short ends by a '+' sign, remove it and display stats, no redirect
  if (short.endsWith('+')) {
    short = short.slice(0, -1);
    showStats = true;
  }

  const data = await shortener.get(short, showStats);

  if (!data)
    return res.status(404).send({ error: 'Not found' });

  if (showStats)
    return res.send(data);

  shortener.increment(short);

  res.redirect(data.url);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});