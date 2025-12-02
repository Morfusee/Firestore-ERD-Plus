import HTTPSuccess from "./HTTPSuccess";


export default class CreatedResponse<T> extends HTTPSuccess<T> {
  constructor( message: string, data: T ) {
    super(201, message,  data)
  }
}
