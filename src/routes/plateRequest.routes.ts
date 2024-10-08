import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import numberplateRequestController from "../controllers/numberPlateRequestController";

export const numberPlateRequestRouter = new Hono();

const requestController = new numberplateRequestController();

const zRequestScheme = z.object({
  city: z.string(),
  letters: z.string(),
  numbers: z.string(),
});

numberPlateRequestRouter.post(
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
