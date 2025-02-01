import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorHandler = () => async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error("Error occurred:", error);

    if (error instanceof HTTPException) {
      return c.json(
        {
          success: false,
          message: error.message,
          status: error.status,
          ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
        },
        error.status
      );
    }

    const statusCode = error instanceof Error ? 400 : 500;
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";

    return c.json(
      {
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV === "development" && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
      statusCode
    );
  }
};
