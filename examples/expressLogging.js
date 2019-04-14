const httpContext = require('express-http-context')
const winston = require('winston')

const requestIdFormat = winston.format((info, opts) => {
  const reqId = httpContext.get('reqId')
  info.reqId = reqId
  return info
})

const logger = winston.createLogger({
  format: winston.format.combine(winston.format.simple(), winston.format.timestamp(), requestIdFormat()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.simple(), winston.format.timestamp()),
      level: 'info',
      handleExceptions: true
    })
  ],
  exitOnError: false
})

module.exports = logger