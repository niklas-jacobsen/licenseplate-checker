import { Hono } from "hono";

export const indexRouter = new Hono();

indexRouter.get("/", (c) => c.json({ message: "Backend running" }));