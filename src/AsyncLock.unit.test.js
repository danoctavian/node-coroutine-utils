const AsyncLock = require('./AsyncLock')
const utils = require('./utils')

describe('AsyncLock', () => {

  it('coordinates between 2 coroutines', async () => {
    const lock = new AsyncLock()
    const firstHold = await lock.acquire()

    const desiredWorkerValue = 'VALUEX'
    let workerValue = undefined
    ;(async () => {
      await lock.acquire()
      workerValue = desiredWorkerValue

      await lock.acquire()
      workerValue = 'VALUEY'
    })()
    await utils.sleep(100)
    expect(workerValue).toEqual(undefined)
    firstHold.release()
    await utils.sleep(100)
    await utils.sleep(100)
    expect(workerValue).toEqual(desiredWorkerValue)
  })

  it('coordinates between multiple coroutines', async () => {
    const lock = new AsyncLock()
    const firstHold = await lock.acquire()

    const desiredWorker1Value = 'VALUEX'
    let worker1Hold = null
    const desiredWorker2Value = 'VALUEY'
    let worker2Hold = null
    const desiredWorker3Value = 'VALUEZ'
    let worker3Hold = null
    let workerValue = undefined
    ;(async () => {
      worker1Hold = await lock.acquire()
      workerValue = desiredWorker1Value
    })()
    ;(async () => {
      worker2Hold =await lock.acquire()
      workerValue = desiredWorker2Value
    })()
    ;(async () => {
      worker3Hold = await lock.acquire()
      workerValue = desiredWorker3Value
    })()
    await utils.sleep(100)
    expect(workerValue).toEqual(undefined)
    firstHold.release()
    await utils.sleep(100)
    expect(workerValue).toEqual(desiredWorker1Value)
    worker1Hold.release()
    await utils.sleep(100)
    expect(workerValue).toEqual(desiredWorker2Value)
    worker2Hold.release()
    await utils.sleep(100)
    expect(workerValue).toEqual(desiredWorker3Value)
  })
})