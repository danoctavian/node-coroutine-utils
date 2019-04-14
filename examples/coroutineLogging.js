const winston = require('winston')
const getNamespace = require('cls-hooked').getNamespace
const createNamespace = require('cls-hooked').createNamespace
const uuidv4 = require('uuid/v4')

const LOGGING_NAMESPACE_NAME = 'abb51eaa-749b-475c-9cba-8d7fa05b769f'
const CONTINUATION_ID_VAR_NAME = 'continuationId'

let loggingSession = getNamespace(LOGGING_NAMESPACE_NAME)
if (!loggingSession) {
  loggingSession = createNamespace(LOGGING_NAMESPACE_NAME)
}

function runWithContinuationId(value, f) {
  if (!value) {
    value = uuidv4()
  }
  let returnValue = null
  loggingSession.run(() => {
    loggingSession.set(CONTINUATION_ID_VAR_NAME, value)
    returnValue = f()
  })
  return returnValue
}

const continuationIdFormat = winston.format((info, opts) => {
  const continuationId = loggingSession.get(CONTINUATION_ID_VAR_NAME)
  info.continuationId = continuationId
  return info
})

const logger = winston.createLogger({
  format: winston.format.combine(winston.format.json(), winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }), continuationIdFormat()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.simple(), winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }), continuationIdFormat()),
      level: 'info',
      handleExceptions: true
    })
  ],
  exitOnError: false
});

logger.runWithContinuationId = runWithContinuationId
module.exports = logger