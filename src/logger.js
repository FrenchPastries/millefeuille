const chalk = require('chalk')
const helpers = require('./helpers')

const stacktrace = error => {
  if (helpers.config.isDev) {
    console.error(chalk.bold.red(error.stack))
  }
}

module.exports = {
  stacktrace,
}
