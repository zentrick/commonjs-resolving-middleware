# middleware-resolve-commonjs

[![npm](https://img.shields.io/npm/v/middleware-resolve-commonjs.svg)](https://www.npmjs.com/package/middleware-resolve-commonjs) [![Dependencies](https://img.shields.io/david/zentrick/middleware-resolve-commonjs.svg)](https://david-dm.org/zentrick/middleware-resolve-commonjs) [![Build Status](https://img.shields.io/travis/zentrick/middleware-resolve-commonjs.svg)](https://travis-ci.org/zentrick/middleware-resolve-commonjs) [![Coverage Status](https://img.shields.io/coveralls/zentrick/middleware-resolve-commonjs.svg)](https://coveralls.io/r/zentrick/middleware-resolve-commonjs) [![JavaScript Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

Connect middleware that serves CommonJS modules.

## Usage

```js
import middlewareResolveCommonjs from 'middleware-resolve-commonjs'

app.use(middlewareResolveCommonjs())
```

This will make the server resolve `/foo/bar` to either `/foo/bar.js` or
`/foo/bar/index.js`, exactly like a `require()` call in Node.js.

In addition to updating the request URI, the middleware adds an
`X-Npm-Module-Type` header to the response, which takes a value of `file` or
`directory`. For `import './foo/bar'`, a value of `file` means that
`./foo/bar.js` is the resolved module, whereas `directory` means that it is
`./foo/bar/index.js`.

## Module Loader Integration

You can leverage the `X-Npm-Module-Type` header on the client side to correct
imports of relative paths.

For example, if `./foo/bar` actually means `./foo/bar/index.js`, so a
`directory` import, then any imports listed in that `index.js` will need to be
relative to `./foo/bar`. However, to the module loader, the URL will look like
just another file, so it will wrongfully assume that the directory is `./foo`.

By appending a slash to the parent path when the loader normalizes the URL, you
can amend this. Here's a full code sample that hooks into the
[ES6 Module Loader API](https://github.com/ModuleLoader/es6-module-loader/wiki/Extending-the-ES6-Loader):

```js
var moduleTypes = {}

var systemNormalize = System.normalize

System.normalize = function (name, parentName, parentAddress) {
  if (moduleTypes[parentName] === 'directory') {
    parentName += '/'
    if (parentAddress != null) {
      parentAddress += '/'
    }
  }
  return systemNormalize.call(this, name, parentName, parentAddress)
}

System.fetch = function (load) {
  return fetch(load.address)
    .then(function (res) {
      if (res.status >= 400) {
        throw new Error('HTTP ' + res.status)
      }
      moduleTypes[load.address] = res.headers.get('X-Npm-Module-Type')
      return res.text()
    })
}
```

## Maintainers

- [Tim De Pauw](https://github.com/timdp)
- [Laurent De Smet](https://github.com/laurentdesmet)

## License

MIT
