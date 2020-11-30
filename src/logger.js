const helpers = require('./helpers')

const stacktrace = error => {
  if (helpers.config.isDev) {
    console.error(`\x1B[1;31m${error.stack.toString()}\x1B[0m`)
  }
}

module.exports = {
  stacktrace,
}
