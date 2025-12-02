import HTTPError from "./HTTPError"


export default class ValidationError extends HTTPError {
  constructor( details: any) {
    super(400, 'Validation Error', 'Missing or invalid required fields.', details)
  }
}