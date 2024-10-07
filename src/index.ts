import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";

const app = new Hono();
const prisma = new PrismaClient();

const testRequest = {
  city: "MS",
  letters: "N?",
  numbers: "1?",
};

app.get("/", (c) => {
  return c.text("App is running");
});

app.post("/request", async (c) => {
  await prisma.numberplateRequest.create({
    data: {
      city: testRequest.city,
      letters: testRequest.letters,
      numbers: testRequest.numbers,
    },
  });
  return c.text("User added");
});

export default app;
