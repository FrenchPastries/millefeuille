export type FromContent = {
  message: string
  stackTrace?: string
}

export const fromError = (error: Error): FromContent => {
  const { message, stack } = error
  return { message, stackTrace: stack }
}

export const fromContent = (content: any): FromContent => {
  if (content instanceof Error) {
    return fromError(content)
  } else {
    const message = JSON.stringify(content, null, 2)
    return { message }
  }
}
