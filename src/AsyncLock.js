class AsyncLock {
  constructor(isUnlocked = true) {
    this.isLocked = !isUnlocked
    this.waiterQueue = []
    this.resolverQueue = []
  }

  async acquire() {
    if (this.isLocked) {
      const acquirementPromise = new Promise(resolve => {
        this.resolverQueue.push(resolve)
      })
      this.waiterQueue.push(acquirementPromise)
      await acquirementPromise
    }
    this.isLocked = true
    return new LockHold(this)
  }

  _release() {
    const next = this.waiterQueue.shift()
    const nextResolve = this.resolverQueue.shift()

    if (next) {
      nextResolve()
    }

    if (this.waiterQueue.length === 0) {
      this.isLocked = false
    }
  }
}

class LockHold {
  constructor(asyncLock) {
    this.released = false
    this.asyncLock = asyncLock
  }
  release() {
    if (this.released) {
      throw new Error('Lock hold already released! Cannot release again.')
    } else {
      this.asyncLock._release()
      this.released = true
    }
  }
}

module.exports = AsyncLock