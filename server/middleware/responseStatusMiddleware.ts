import { Request, Response, NextFunction } from "express";
import successMiddleware from "./successMiddleware";
import errorMiddleware from "./errorMiddleware";
import HTTPSuccess from "@root/success/HTTPSuccess";
import HTTPError from "@root/errors/HTTPError";
import { isSuccessStatus } from "@root/utils/isSuccessStatus";

export const responseStatusMiddleware = <T>(
  data: HTTPSuccess<T> | HTTPError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isSuccessStatus(data.status)) {
    successMiddleware(data, req, res, next);
    return;
  }

  errorMiddleware(data as HTTPError, req, res, next);
};
