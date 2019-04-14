class BufferedAsyncChan {
  // private queue Promise<T>[]
  // private resolverQueue: ((T) => void)[]
  // accumulatedValues: T[]
  constructor() {
    this.queue = [
      new Promise(resolve => {
        this.resolverQueue = [resolve]
      })
    ];
    this.accumulatedValues = []
  }

  async read() {
    if (this.accumulatedValues.length > 0) {
      const item = this.accumulatedValues.shift()
      return item
    } else {
      const queueHead = this.queue.shift()

      this.queue.push(
        new Promise(resolve => {
          this.resolverQueue.push(resolve)
        })
      )
      const v = await queueHead
      return v
    }
  }

  write(v) {
    if (this.resolverQueue.length > 1) {
      const resolveHead = this.resolverQueue.shift()
      resolveHead(v)
    } else {
      this.accumulatedValues.push(v)
    }
  }
}

module.exports = BufferedAsyncChan