import {
  html,
  render,
  useEffect,
  useState,
} from './vendor/htm-preact-standalone.module.js'

function App() {
  const [n, setN] = useState('…')
  useEffect(() => {
    rpc({ method: 'friend/commands' }).then((r) => {
      setN(r.result.length)
    })
  }, [])
  return html`HEY! Why Don't U JUST GET UP 'N DANCE MAN!<br />There
    are${` ${n} `} commands`
}

render(html`<${App} />`, document.querySelector('#app'))

async function rpc(request) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ rpc: request }, (response) => {
      if (!response) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }
      resolve(response)
    })
  })
}
