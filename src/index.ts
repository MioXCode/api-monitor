import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { router } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { schedule } from "node-cron";
import { prisma } from "./config/database";
import { MonitorService } from "./services/monitor_service";
import { errorResponse, successResponse } from "./utils/response";

const app = new Hono();

const middlewares = [
  logger(),
  prettyJSON(),
  cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
  errorHandler(),
];
middlewares.forEach((middleware) => app.use("*", middleware));

app.route("/api", router);
app.get("/health", (c) =>
  successResponse(
    c,
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
    },
    "Health check successful"
  )
);

const monitorService = new MonitorService();

const MONITORING_INTERVAL = 60000;
const BATCH_SIZE = 100;

schedule("* * * * *", async () => {
  try {
    const endpoints = await prisma.endpoint.findMany({
      where: {
        status: { not: "DOWN" },
        lastChecked: { lte: new Date(Date.now() - MONITORING_INTERVAL) },
      },
      take: BATCH_SIZE,
      orderBy: { lastChecked: "asc" },
    });

    if (endpoints.length === 0) {
      console.log("No endpoints to monitor");
      return;
    }

    const results = await Promise.allSettled(
      endpoints.map((endpoint) => monitorService.checkEndpoint(endpoint))
    );

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Error checking endpoint ${endpoints[index].id}:`,
          result.reason
        );
      }
    });

    console.log("Monitoring cron job completed");
  } catch (error) {
    console.error("Error in monitoring cron job:", error);
  }
});

export default app;
