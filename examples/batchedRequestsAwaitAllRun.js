const axios = require('axios')
const utils = require('../src/utils')

const MAX_CONCURRENT_REQUESTS = 3
const GENERATION_INTERVAL_MILLIS_MIN = 500
const GENERATION_INTERVAL_MILLIS_MAX = 1500

async function fetchPrices(from, to) {
  const response = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${from}&tsyms=${to}`)
  return response.data
}

const queue = []

function addToQueue(items) {
  queue.push(...items)
}

;(async () => {

  // launch producer coroutine in the background
  runProducer()

  while (true) {
    const toBeScanned = []
    let next = queue.pop()
    while(next && toBeScanned.length < MAX_CONCURRENT_REQUESTS) {
      toBeScanned.push(next)
      next = queue.pop()
    }
    if (toBeScanned.length > 0) {
      await Promise.all(toBeScanned.map(async (target) => {
        const prices = await fetchPrices(target.from, target.to)
        console.log(`1 ${target.from} = ${JSON.stringify(prices)}`)
      }))
    } else {
      // yield to allow the queue to be filled
      await new Promise(resolve => setImmediate(resolve))
    }
  }
})().catch(e => {
  console.log(`FATAL: ${e.stack}`)
  process.exit(1)
})

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min)) + min // The maximum is inclusive and the minimum is inclusive
}

const CRYPTOS = ['ETH', 'BTC']
const FIATS = ['EUR', 'USD', 'EUR,USD']

async function runProducer() {
  try {
    while (true) {
      await utils.sleep(getRandomIntInclusive(GENERATION_INTERVAL_MILLIS_MIN, GENERATION_INTERVAL_MILLIS_MAX))
      const randomCrypto = CRYPTOS[Math.floor(Math.random() * CRYPTOS.length)]
      const randomFiat = FIATS[Math.floor(Math.random() * FIATS.length)]
      addToQueue([{from: randomCrypto, to: randomFiat}])
    }
  } catch (e) {
    log.info(`FATAL: producer failed with ${e.stack}`)
    process.exit(1)
  }
}