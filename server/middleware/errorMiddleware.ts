import HTTPError from "@root/errors/HTTPError";
import { Request, Response, NextFunction } from "express";


export default function errorMiddleware(
  err: HTTPError, 
  _req: Request, 
  res: Response, 
  _next: NextFunction
) {
  if (err instanceof HTTPError) {
    const status = err.status || 500
    const error = err.error
    const message = err.message
    const errors = err.details
    res.status(status).send({ status, error, message, details: errors})
  } else {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      status: 500
    })
  }

}