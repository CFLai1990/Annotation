const express = require('express')
const url = require('url')

const getMiddleware = function (func, logger) {
  return (req, res, next) => {
    let pathname = url.parse(req.url).pathname
    if (req.method != 'GET') {
      return next()
    }
    logger.log(` [Router] Request: ${pathname}`)
    func(pathname, res, next)
  }
}

const setupMiddleware = function (handler, logger) {
  let routes = Object.getOwnPropertyNames(handler)
  for (let route of routes) {
    let middleWare = getMiddleware(handler[route], logger)
    if (route == 'All') {
      this.use(middleWare)
    } else {
      this.get(route, middleWare)
    }
  }
  return this
}

module.exports = (handler, logger) => {
  return setupMiddleware.bind(express.Router())(handler, logger)
}
