import HTTPError from "./HTTPError"


export default class NotFoundError extends HTTPError {
  constructor(message?: string) {
    super(404, 'NotFound Error', message || 'Resource not found')
  }
}