const BufferedAsyncChan = require('./BufferedAsyncChan')
const utils = require('./utils')

describe('BufferedAsyncChan', () => {
  it('allows sending and receiving a set of values', async() => {
    const chan = new BufferedAsyncChan()

    chan.write('MINUS-ONE')
    chan.write('ZERO')
    let v = await chan.read()
    expect(v).toEqual('MINUS-ONE')
    v = await chan.read()
    expect(v).toEqual('ZERO')

    ;(async () => {
      chan.write('ONE')
      await utils.sleep(100)
      chan.write("TWO")
      chan.write("THREE")
      await utils.sleep(100)
      chan.write("FOUR")
      chan.write("FIVE")
      chan.write("SIX")
      await utils.sleep(100)
      chan.write("SEVEN")
      chan.write("EIGHT")
      chan.write("NINE")
      chan.write("TEN")
    })()

    v = await chan.read()
    expect(v).toEqual('ONE')

    v = await chan.read()
    expect(v).toEqual('TWO')

    v = await chan.read()
    expect(v).toEqual('THREE')

    v = await chan.read()
    expect(v).toEqual('FOUR')

    v = await chan.read()
    expect(v).toEqual('FIVE')

    v = await chan.read()
    expect(v).toEqual('SIX')

    v = await chan.read()
    expect(v).toEqual('SEVEN')
  })
})