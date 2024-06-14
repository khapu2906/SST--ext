# EZ--ext

Although chrome runtime only except Js, but we can point the manifest.json to
the `build/` directory, where `.ts` files are transpiled into valid Js code

## Build

Require NodeJs

```bash
npm install && npm run build
```

hot-transpiled at changes

```bash
npm run watch
```

## Issue

Chrome, the targeted browser, and other browser only support `.webm` audio
format, which require additional conversion to `.wav` format at endpoints.
Direct encoding to `.wav` format at client-side would be of great improvement.
