import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const successResponse = <T>(
  c: Context,
  data: T,
  message: string = "Success",
  status: number = 200
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return c.json(response, status as ContentfulStatusCode);
};

export const errorResponse = (
  c: Context,
  message: string = "Internal Server Error",
  status: number = 500
) => {
  const response: ApiResponse<null> = {
    success: false,
    message,
  };
  return c.json(response, status as ContentfulStatusCode);
};
