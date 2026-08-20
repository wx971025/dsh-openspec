# Contributing

## Develop

```sh
npm install
npm test
npm run build
```

`lib/index.js` and `lib/client.js` are the runtime artifacts DeepSeek Harness loads. Rebuild them before linking the plugin into a web profile.

## Load locally

```sh
dsh plugin --profile web add /absolute/path/to/dsh-openspec
dsh web
```

Restart `dsh web` after a client rebuild so the browser picks up `lib/client.js`.
