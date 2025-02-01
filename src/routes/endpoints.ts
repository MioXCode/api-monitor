import { Hono } from "hono";
import { EndpointService } from "../services/endpoint_service";
import { validateRequest } from "../middleware/validateRequest";
import { endpointSchema } from "../schemas/endpoint_schema";
import { authMiddleware } from "../middleware/authMiddleware";

const endpoints = new Hono();
const endpointService = new EndpointService();

endpoints.use("*", authMiddleware);

endpoints.post("/", validateRequest(endpointSchema), async (c) => {
  const user = c.get("user" as any);
  const data = await c.req.json();
  const endpoint = await endpointService.create(user.userId, data);
  return c.json({ success: true, data: endpoint });
});

endpoints.get("/", async (c) => {
  const user = c.get("user" as any);
  const endpoints = await endpointService.findAll(user.userId);
  return c.json({ success: true, data: endpoints });
});

endpoints.get("/:id", async (c) => {
  const user = c.get("user" as any);
  const id = c.req.param("id");
  const endpoint = await endpointService.findOne(id, user.userId);

  if (!endpoint) {
    return c.json({ success: false, message: "Endpoint not found" }, 404);
  }

  return c.json({ success: true, data: endpoint });
});

endpoints.put("/:id", validateRequest(endpointSchema), async (c) => {
  const user = c.get("user" as any);
  const id = c.req.param("id");
  const data = await c.req.json();
  const endpoint = await endpointService.update(id, user.userId, data);
  return c.json({ success: true, data: endpoint });
});

endpoints.delete("/:id", async (c) => {
  const user = c.get("user" as any);
  const id = c.req.param("id");
  const endpoint = await endpointService.delete(id, user.userId);
  return c.json({ success: true, data: endpoint });
});

export { endpoints };
