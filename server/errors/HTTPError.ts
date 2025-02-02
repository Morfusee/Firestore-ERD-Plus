
export default class HTTPError extends Error {
  status: number
  error: string
  details?: any

  constructor(status: number, error: string, message: string, details?: any) {
    super(message)
    this.name = this.constructor.name
    this.status = status
    this.error = error
    this.details = details
  }
}