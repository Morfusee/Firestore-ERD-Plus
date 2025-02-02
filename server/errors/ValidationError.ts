import HTTPError from "./HTTPError"


export default class ValidationError extends HTTPError {
  constructor( details: any) {
    super(404, 'Validation Error', 'You have invalid parameters or body data', details)
  }
}