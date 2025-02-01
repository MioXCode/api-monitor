import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { router } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { schedule } from "node-cron";
import { prisma } from "./config/database";
import { MonitorService } from "./services/monitor_service";

const app = new Hono();
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", cors());
app.use("*", errorHandler());

app.route("/api", router);
app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

const monitorService = new MonitorService();

schedule("* * * * *", async () => {
  try {
    const endpoints = await prisma.endpoint.findMany({
      where: {
        status: { not: "DOWN" },
        lastChecked: { lte: new Date(Date.now() - 60000) },
      },
    });

    await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          await monitorService.checkEndpoint(endpoint);
        } catch (error) {
          console.error(`Error checking endpoint ${endpoint.id}:`, error);
        }
      })
    );
  } catch (error) {
    console.error("Error in monitoring cron job:", error);
  }
});

export default app;
