import HTTPSuccess from "./HTTPSuccess";


export default class SuccessResponse<T> extends HTTPSuccess<T> {
  constructor( message: string, data: T ) {
    super(200, message,  data)
  }
}

