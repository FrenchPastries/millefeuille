const fromError = error => {
  const { message, stack } = error
  return { message, stackTrace: stack }
}

const fromContent = content => {
  if (content instanceof Error) {
    return fromError(content)
  } else {
    const message = JSON.stringify(content, null, 2)
    return { message }
  }
}

module.exports = {
  fromError,
  fromContent,
}
