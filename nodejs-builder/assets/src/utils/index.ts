import { Request, Response } from "express";

export class ApiError extends Error {
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }

  status: number;
}

export const createController = (func: (req: Request, res: Response) => any) => {
  return async (req: Request, res: Response) => {
    try {
      const result = await func(req, res);
      res.status(200).send(createResponse(result, "success", 200));
    } catch (error: any) {
      if (error instanceof ApiError) {
        res.status(error.status).send(createResponse(null, error.message, error.status));
      } else {
        console.error("[ERROR]", `[${new Date().toISOString()}]`, error?.message);
        res.status(500).send(createResponse(null, "Internal server error", 500));
      }
    }
  };
};

export const createResponse = (data: any = null, message: string = "success", status: number = 200) => {
  return {
    data,
    message,
    status,
  };
};
