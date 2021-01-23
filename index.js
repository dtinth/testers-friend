if (require('./devFlag').value) {
  // @ts-ignore
  module.exports = require('./src/API')
} else {
  // @ts-ignore
  module.exports = require('./lib/API')
}
