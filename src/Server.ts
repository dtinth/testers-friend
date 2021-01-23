import { randomBytes } from 'crypto'
import express from 'express'
import { Server } from 'http'
import { runInNewContext } from 'vm'

export async function createServer({ getContext }) {
  const secret = randomBytes(32).toString('hex')
  const app = express()
  app.use(express.json())
  app.post('/' + secret + '/rpc', async (req, res, next) => {
    try {
      const result = await runInNewContext(
        `(async()=>{\n${req.body.code}\n})()`,
        getContext()
      )
      res.json({
        result,
      })
    } catch (error) {
      console.error(error)
      res.json({
        error: { message: error.message },
      })
    }
  })
  return new Promise<FriendServer>((resolve, reject) => {
    app.listen(0, '127.0.0.1', function () {
      const server: Server = this
      const address = this.address()
      server.unref()
      resolve({
        address: `http://127.0.0.1:${address.port}/${secret}/rpc`,
        close: (...args) => {
          return server.close(...args)
        },
      })
    })
  })
}

type FriendServer = {
  address: string
  close: Server['close']
}
