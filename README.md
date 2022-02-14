<div align="center">
  <h1><code>brightsign-webpack-react</code></h1>
  <p><strong>Webpack + React + Typescript + Tailwind</strong></p>
</div>

## Install

Run `yarn` in the repository root.

## Development

- See [`package.json`](./package.json) scripts. TypeScript's `tsc` can be run
  with `yarn tsc`.
- When running the local development server, append the output HTML file name
  with its extension to the URL.

### Webpack

- Both JavaScript and Typescript modules will work and are interoperable.
- [`swc`](https://swc.rs/docs/configuration/compilation) is used to transpile
  JS/TS, see `ecmaVersion` in the webpack config.
- BrightSign modules (`@brightsign/...` imports) are automatically included in
  webpack externals. If more externals are needed, see
  [combining syntaxes](https://webpack.js.org/configuration/externals/#combining-syntaxes).
- When adding path aliases, they must be added to `tsconfig.json`, the webpack
  `swcOptionsNode`, and both webpack configs' `resolve.alias`.

### TypeScript

- Add a `@ts-expect-error` comment above BrightSign module imports (see
  [`node/api.ts`](./node/api.ts)).
