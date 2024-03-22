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