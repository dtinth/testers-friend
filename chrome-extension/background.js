let targetUrl

/**
 * @param {string} url
 */
function setTarget(url) {
  targetUrl = url
  return 'Target set completed; ' + url
}

function asyncResponse(asyncFn) {
  return (request, sender, sendResponse) => {
    Promise.resolve(asyncFn(request, sender)).then(
      (result) => sendResponse({ result }),
      (error) => {
        console.error(error)
        sendResponse({ error: { message: error.message } })
      }
    )
    return true
  }
}

chrome.runtime.onMessage.addListener(
  asyncResponse(async (request, sender) => {
    console.log(
      sender.tab
        ? 'from a content script:' + sender.tab.url
        : 'from the extension'
    )
    if (request.rpc) {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.rpc),
      })
      const data = await response.json()
      if (data.result) {
        return data.result
      } else {
        throw new Error('RPC error: ' + data.error.message)
      }
    }
  })
)
