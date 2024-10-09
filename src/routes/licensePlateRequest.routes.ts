import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { zRequestScheme } from "../validators/zodSchemes";
import licenseplateRequestController from "../controllers/licensePlateRequestController";

export const licensePlateRequestRouter = new Hono();

const requestController = new licenseplateRequestController();

licensePlateRequestRouter.post(
  "/new",
  zValidator("json", zRequestScheme),
  async (c) => {
    const body = await c.req.valid("json");

    if (
      await requestController.getById({
        city: body.city,
        letterRequest: body.letters,
        numberRequest: body.numbers,
      })
    )
      return c.json(
        { message: "A request with these parameters already exists" },
        400
      );

    await requestController.create({
      city: body.city,
      letterRequest: body.letters,
      numberRequest: body.numbers,
    });

    return c.json(
      {
        message: `Request ${body.city}-${body.letters}-${body.numbers} was created successfully`,
      },
      200
    );
  }
);
