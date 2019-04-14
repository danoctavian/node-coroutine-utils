const express = require('express')
const uuid = require('uuid')
const httpContext = require('express-http-context')
const log = require('./expressLogging')

const app = express()

app.use(httpContext.middleware)
// Run the context for each request. Assign a unique identifier to each request
app.use((req, res, next) => {
  httpContext.set('reqId', uuid.v1())
  next()
})

app.use('/hello/:name', async (req, res) => {
  log.info(`Responding to hello from ${req.params.name}`)
  res.json({hello: req.params.name})
})

/*
  do
    curl localhost:3000/hello/yournamehere
  to see it in action
*/
const port = 3000
app.listen(port)