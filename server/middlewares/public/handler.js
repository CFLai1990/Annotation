const path = require('path')
const fileTypes = require('./fileTypes.json')
const dirRoute = 'server\\public\\'
const root = { root: path.normalize(`${process.cwd()}\\${dirRoute}`) }
let logger

const All = function (route, res, next) {
  if (typeof this[route] === 'function') {
    return next()
  }
  let extName = path.extname(route)
  let fileRoute = path.normalize(route) // path.replace(new RegExp('/', 'g'), '\\')
  logger.log(` [Public Handler] File: ${fileRoute}`)
  res.type(fileTypes[extName]).sendFile(fileRoute, root, err => {
    if (err) {
      logger.error(` [Public Handler] ${err}`)
      res.status(err.status).end()
    }
  })
}

module.exports = inputLogger => {
  logger = inputLogger
  return { All }
}
