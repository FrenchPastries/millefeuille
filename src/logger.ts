import * as helpers from './helpers'

export const stacktrace = (error: Error) => {
  if (helpers.config.isDev) {
    console.error(`\x1B[1;31m${error.stack?.toString()}\x1B[0m`)
  }
}
