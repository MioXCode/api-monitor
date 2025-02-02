import { Hono } from "hono";
import { MonitorService } from "../services/monitor_service";
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../config/database";
import { EndpointService } from "../services/endpoint_service";
import { successResponse, errorResponse } from "../utils";

const monitor = new Hono();
const monitorService = new MonitorService();
const endpointService = new EndpointService();

monitor.use("*", authMiddleware);

monitor.post("/check/:endpointId", async (c) => {
  try {
    const user = c.get("user" as any);
    const endpointId = c.req.param("endpointId");

    const endpoint = await endpointService.findOne(endpointId, user.userId);
    const result = await monitorService.checkEndpoint(endpoint);
    return successResponse(c, result, "Endpoint check completed");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message, 404);
    }
    return errorResponse(c, "An error occurred", 404);
  }
});

monitor.get("/stats/:endpointId", async (c) => {
  try {
    const user = c.get("user" as any);
    const endpointId = c.req.param("endpointId");

    const stats = await prisma.monitorLog.groupBy({
      by: ["success"],
      where: {
        endpointId,
        endpoint: { userId: user.userId },
        timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      _count: true,
      _avg: {
        responseTime: true,
      },
    });

    return successResponse(c, stats, "Stats retrieved successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return errorResponse(c, error.message);
    }
    return errorResponse(c, "An error occurred");
  }
});

export { monitor };
