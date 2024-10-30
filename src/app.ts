import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import router from "./routes";

const app = new Hono();
app.use(secureHeaders());

app.route("", router);
export default app;
