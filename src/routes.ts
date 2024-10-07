import { Hono } from "hono";
import { indexRouter } from "./routes/index.routes";
import { numberPlateRequestRouter } from "./routes/plateRequest.routes";

const router = new Hono();

router.route("/", indexRouter);
router.route("/request", numberPlateRequestRouter);

export default router;
