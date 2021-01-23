require('./devFlag').value = 1
require('ts-node/register/transpile-only')
require('./src/CLI').main()
