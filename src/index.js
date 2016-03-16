import fsp from 'fs-promise'
import url from 'url'
import path from 'path'

const fileExists = async (path) => {
  try {
    await fsp.stat(path)
    return true
  } catch (err) {
    return false
  }
}

const DEFAULT_OPTIONS = {
  ext: '.js',
  header: 'X-Npm-Module-Type',
  root: process.cwd()
}

export default (options) => {
  options = Object.assign({}, DEFAULT_OPTIONS, options)

  return async (req, res, next) => {
    const base = path.join(options.root, '.' + url.parse(req.url).pathname)

    const configs = [
      {ext: options.ext, type: 'file'},
      {ext: '/index' + options.ext, type: 'directory'}
    ]
    let i = 0
    while (i < configs.length && !(await fileExists(base + configs[i].ext))) {
      ++i
    }
    if (i < configs.length) {
      req.url += configs[i].ext
      res.setHeader(options.header, configs[i].type)
    }
    next()
  }
}
