import { Browser, launch } from 'puppeteer'
import { resolve } from 'path'
import delay from 'delay'
import yargs from 'yargs'
import inspector from 'inspector'
import { createServer } from './Server'
import { runInNewContext } from 'vm'

export function main() {
  inspector.open()
  yargs
    .strict()
    .demandCommand()
    .command('$0', '', {}, async () => {
      const ext = resolve(__dirname, '../chrome-extension')
      const browser = await launch({
        headless: false,
        args: ['--load-extension=' + ext, '--disable-extensions-except=' + ext],
        ignoreDefaultArgs: ['--disable-extensions'],
      })

      const context: any = { browser, console }
      context.global = context
      Object.assign(global, { browser, puppeteer: require('puppeteer') })
      const server = await createServer({
        handlers: {
          'friend/execute': async ({ code }) => {
            return await runInNewContext(`(async()=>{\n${code}\n})()`, context)
          },
          'friend/commands': async () => {
            return [
              {
                command: 'friend.reloadConfig',
                title: 'Reload configuration file',
                category: 'Friend',
              },
              {
                command: 'friend.openDevTools',
                title: 'Open Puppeteer REPL',
                category: 'Friend',
              },
            ]
          },
        },
      })
      console.log('[testers-friend]', 'RPC server set up at', server.address)

      const extension = await getExtension(browser)
      const result = await (await extension.target.page()).evaluate(
        (address, inspectorUrl) => {
          // @ts-ignore
          setTarget(address)
          chrome.windows.create({
            url: `devtools://devtools/bundled/worker_app.html?ws=${inspectorUrl.replace(
              'ws://',
              ''
            )}&panel=console`,
            type: 'popup',
          })
        },
        server.address,
        inspector.url()
      )
    })
    .parse()
}

async function getExtension(browser: Browser) {
  let deadline = Date.now() + 15000
  while (Date.now() < deadline) {
    const targets = await browser.targets()
    const usableTargets = targets.filter(
      (t) => t.type() === 'background_page' && t.url()
    )
    if (usableTargets.length > 1) {
      throw new Error(
        'More than 1 background pages found. This is not supported.'
      )
    }
    if (usableTargets.length > 0) {
      return {
        target: usableTargets[0],
        extensionId: usableTargets[0].url().split('/')[2],
      }
    }
    await delay(100)
  }
  throw new Error('Unable to get the extension after 15 seconds.')
}
