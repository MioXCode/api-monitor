import { Hono } from "hono";
import { MonitorService } from "../services/monitor_service";
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../config/database";
import { EndpointService } from "../services/endpoint_service";

const monitor = new Hono();
const monitorService = new MonitorService();
const endpointService = new EndpointService();

monitor.use("*", authMiddleware);

monitor.post("/check/:endpointId", async (c) => {
  const user = c.get("user" as any);
  const endpointId = c.req.param("endpointId");

  const endpoint = await endpointService.findOne(endpointId, user.userId);
  if (!endpoint) {
    return c.json({ success: false, message: "Endpoint not found" }, 404);
  }

  const result = await monitorService.checkEndpoint(endpoint);
  return c.json({ success: true, data: result });
});

monitor.get("/stats/:endpointId", async (c) => {
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

  return c.json({ success: true, data: stats });
});

export { monitor };
