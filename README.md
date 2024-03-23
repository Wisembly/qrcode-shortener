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
- `secureKey`: the secret key to access the stats. If not provided, the stats will be public.

Example: `http://localhost:3322/shorten?url=https://www.google.com&desiredShort=goog&secureKey=yourPublicKey`

## Register a secureKey

A secure key is used to generate short codes whose stats won't be public. To register a secure key, use the following command:

```bash
curl -X POST "http://localhost:3322/secure" -d "key=yourPublicKey&secret=yourSecretKey" -H "Content-Type: application/x-www-form-urlencoded" -H "Accept: application/json"
```

Register it once, and use `secureKey=yourPublicKey` on each request to generate a short code.
To retrieve stats of a shortcode, use `secret=yourSecretKey` as the secret key.

## Get shortcode stats

```bash
curl -X GET "http://localhost:3322/stats?{short}+"
```

Use the shortcode you want to get the stats from, followed by a `+` sign.

Optional parameters:

- `secret`: the secret key to access the stats if the shortcode is secured

## Dynamically generate a QRCode

```html
<a href="http://localhost:3322/qrcode?url=https://www.google.com">
```

Optional parameters:

- `desiredShort`: the desired short url. If not provided, a random 4 characters string will be generated.
- `size`: the size of the QRCode. Default is 512x512.
- `quality`: the quality of the QRCode (L, M, H). Default is M.
- `output`: the output format of the QRCode (png, data). Default is png.
- `secureKey`: the secret key used to secure the shortcode stats

Example: `http://localhost:3322/qrcode?url=https://www.google.com&desiredShort=goog&size=256x256&quality=H&output=data&secureKey=yourPublicKey`
