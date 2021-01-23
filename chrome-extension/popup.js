document.getElementById('scriptForm').onsubmit = (e) => {
  e.preventDefault()
  const code = /** @type {HTMLInputElement} */ (document.getElementById('code'))
  chrome.runtime.sendMessage({ execute: { code: code.value } }, (response) => {
    if (!response) {
      alert(chrome.runtime.lastError.message)
      return
    }
  })
}
