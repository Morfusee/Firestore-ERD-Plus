import HTTPError from "./HTTPError"


export default class BadRequestError extends HTTPError {
  constructor(message?: string) {
    super(400, 'Bad Request', message || 'An error has occured')
  }
}