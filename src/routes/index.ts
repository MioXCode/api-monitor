import { Hono } from "hono";
import { auth } from "./auth";
import { endpoints } from "./endpoints";
import { monitor } from "./monitor";
import { notifications } from "./notifications";

const router = new Hono();

router.route("/auth", auth);
router.route("/endpoints", endpoints);
router.route("/monitor", monitor);
router.route("/notifications", notifications);

export { router };
