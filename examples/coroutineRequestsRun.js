const axios = require('axios')
const BufferedAsyncChan = require('../src/BufferedAsyncChan')
const utils = require('../src/utils')

const MAX_CONCURRENT_REQUESTS = 3
const GENERATION_INTERVAL_MILLIS_MIN = 500
const GENERATION_INTERVAL_MILLIS_MAX = 1500

async function fetchPrices(from, to) {
  const response = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${from}&tsyms=${to}`)
  return response.data
}

const bufferedAsyncChan = new BufferedAsyncChan()

function addToQueue(items) {
  for (let i = 0; i < items.length; i++) {
    bufferedAsyncChan.write(items[i])
  }
}

;(async () => {

  // launch producer coroutine
  runProducer()

  for (let i = 0; i < MAX_CONCURRENT_REQUESTS; i++) {

    // launch coroutine
    ;(async () => {
      while (true) {
        try {
          const target = await bufferedAsyncChan.read()
          const prices = await fetchPrices(target.from, target.to)
          console.log(`Fetched ${target.from} = ${JSON.stringify(prices)}`)
        } catch (e) {
          console.log(`Failed to process value with ${e.stack}`)
        }
      }
    })()
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
  while (true) {

    try {
      await utils.sleep(getRandomIntInclusive(GENERATION_INTERVAL_MILLIS_MIN, GENERATION_INTERVAL_MILLIS_MAX))
      const randomCrypto = CRYPTOS[Math.floor(Math.random() * CRYPTOS.length)]
      const randomFiat = FIATS[Math.floor(Math.random() * FIATS.length)]
      addToQueue([{from: randomCrypto, to: randomFiat}])
    } catch (e) {
      console.log(`Producer failed with ${e.stack}`)
    }
  }
}