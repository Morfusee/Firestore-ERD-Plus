import { Request, Response, NextFunction } from "express";
import successMiddleware from "./successMiddleware";
import errorMiddleware from "./errorMiddleware";
import { SuccessResponse } from "@root/success/SuccessResponse";
import HTTPError from "@root/errors/HTTPError";
import { isSuccessStatus } from "@root/utils/isSuccessStatus";

export const responseStatusMiddleware = <T>(
  data: SuccessResponse<T> | HTTPError,
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
