import HTTPError from "./HTTPError"


export default class ConflictError extends HTTPError {
  constructor(message?: string) {
    super(409, 'Conflict Error', message || 'Conflict occured')
  }
}