const grpc = require('grpc')
const path = require('path')
const proto_path = path.normalize(__dirname + '/protos/helloworld.proto')
const hello_proto = grpc.load(proto_path).helloworld
let logger
let rpcServer

const All = function (route, res, next) {
  if (typeof this[route] === 'function') {
    return next()
  }
  const client = new hello_proto.Greeter(
    rpcServer,
    grpc.credentials.createInsecure()
  )
  let userName = route.replace('/', '')
  logger.log(` [RPC Handler] Parameter: ${userName}`)
  client.sayHello({ name: userName }, function (rpcErr, rpcRes) {
    if (rpcErr) {
      logger.error(` [RPC Handler] ${rpcErr.stack}`)
      res.status(500).send(rpcErr.message)
    } else {
      res.status(200).send(rpcRes.message)
    }
  })
}

module.exports = (inputLogger, inputRpc) => {
  logger = inputLogger
  rpcServer = inputRpc
  return { All }
}
