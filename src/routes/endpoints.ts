import { Hono } from "hono";
import { EndpointService } from "../services/endpoint_service";
import { validateRequest } from "../middleware/validateRequest";
import { endpointSchema } from "../schemas/endpoint_schema";
import { authMiddleware } from "../middleware/authMiddleware";
import { successResponse, errorResponse } from "../utils";

const endpoints = new Hono();
const endpointService = new EndpointService();

endpoints.use("*", authMiddleware);

endpoints.post("/", validateRequest(endpointSchema), async (c) => {
  try {
    const user = c.get("user" as any);
    const data = await c.req.json();
    const endpoint = await endpointService.create(user.userId, data);
    return successResponse(c, endpoint, "Endpoint created successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message, 400);
    }
    return errorResponse(c, "An error occurred", 400);
  }
});

endpoints.get("/", async (c) => {
  try {
    const user = c.get("user" as any);
    const endpoints = await endpointService.findAll(user.userId);
    return successResponse(c, endpoints, "Endpoints retrieved successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message);
    }
    return errorResponse(c, "An error occurred");
  }
});

endpoints.get("/:id", async (c) => {
  try {
    const user = c.get("user" as any);
    const id = c.req.param("id");
    const endpoint = await endpointService.findOne(id, user.userId);
    return successResponse(c, endpoint, "Endpoint retrieved successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message, 404);
    }
    return errorResponse(c, "An error occurred", 404);
  }
});

endpoints.put("/:id", validateRequest(endpointSchema), async (c) => {
  try {
    const user = c.get("user" as any);
    const id = c.req.param("id");
    const data = await c.req.json();
    const endpoint = await endpointService.update(id, user.userId, data);
    return successResponse(c, endpoint, "Endpoint updated successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message, 400);
    }
    return errorResponse(c, "An error occurred", 400);
  }
});

endpoints.delete("/:id", async (c) => {
  try {
    const user = c.get("user" as any);
    const id = c.req.param("id");
    const endpoint = await endpointService.delete(id, user.userId);
    return successResponse(c, endpoint, "Endpoint deleted successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message, 400);
    }
    return errorResponse(c, "An error occurred", 400);
  }
});

export { endpoints };
