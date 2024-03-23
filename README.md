# QRCode shortener

This very small lib allows to generate a very simple and readable QRCode for a given URL. Under the hood, it shortens the url to a 4 characters url (use a small domain too) and generates a QRCode for it. This way, the QRCode is very small and can be printed on a small surface or scanned from a distance.

On top of that, you can access a very simple count stat on the QRCode usage.

# Pre-requisites

- Node.js (LTS version recommended)
- Redis (LTS version recommended)

# Installation

```bash
npm install
```

# Run

pm2 is recommended to run the server in production.
An ecosystem dist file is provided in the repository for file structure and variables.

```bash
pm2 start ecosystem.config.js
```

# Usage

## Shorten a URL

```bash
curl -X GET "http://localhost:3322/shorten?url=https://www.google.com"
```
Optional parameters:

- `desiredShort`: the desired short url. If not provided, a random 4 characters string will be generated.

## dynamically generate a QRCode

```html
<a href="http://localhost:3322/qrcode?url=https://www.google.com">
```

Optional parameters:
- `desiredShort`: the desired short url. If not provided, a random 4 characters string will be generated.
- `size`: the size of the QRCode. Default is 512x512.
- `quality`: the quality of the QRCode (L, M, H). Default is M.
- `output`: the output format of the QRCode (png, data). Default is png.

## Get shortcode stats

```bash
curl -X GET "http://localhost:3322/stats?{short}+"
```

Use the shortcode you want to get the stats from, followed by a `+` sign.