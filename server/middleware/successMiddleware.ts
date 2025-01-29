import { SuccessResponse } from "@root/success/SuccessResponse";
import { Request, Response, NextFunction } from "express";

export default function successMiddleware<T>(
  success: SuccessResponse<T>,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (success) {
    const status = success.status || 200;
    const message = success.message;
    const data = success.data;
    res.status(status).send({
      status,
      message,
      data,
    });
    return;
  }

  res.status(500).json({
    message: "Operation success.",
    status: 500,
  });
}
