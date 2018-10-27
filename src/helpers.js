const debugMap = elem => {
  console.log(elem)
  return elem
}

const debug = elem => {
  if (process.env.SERVER_ENV === 'development') {
    console.log(elem)
  }
}

module.exports = {
  debug,
  debugMap
}
