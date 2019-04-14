const axios = require('axios')
;(async () => {
  const r = await axios.get('https://www.etherchain.org/api/gasPriceOracle')
  console.log(`root coroutine Oracle answer: ${r.data.standard}`)

  ;(async () => {
    try {
      console.log('Running coroutine 0..')
      const r = await axios.get('https://www.etherchain.org/api/gasPriceOracle')
      console.log(`coroutine 0 Oracle answer: ${r.data.standard}`)
    } catch (e) {
      console.log(`coroutine 1 failed with ${e.stack}`)
    }
  })()

  ;(async () => {
    try {
      console.log('Running coroutine 1..')
      const r = await axios.get('https://www.etherchain.org/api/gasPriceOracle')
      console.log(`coroutine 1 Oracle answer: ${r.data.standard}`)
    } catch (e) {
      console.log(`coroutine 1 failed with ${e.stack}`)
    }
  })()
})().catch(e => console.log(`root coroutine failed with ${e.stack}`))