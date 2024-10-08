import { Hono } from "hono";
import numberplateRequestController from "../controllers/numberPlateRequestController";

export const numberPlateRequestRouter = new Hono();

const requestController = new numberplateRequestController();
const testRequest = {
  city: "MS",
  letters: "N?",
  numbers: "1?",
};

numberPlateRequestRouter.post("/new", async (c) => {
  const body = await c.req.json();

  if (
    await requestController.getById({
      city: body.id.city,
      letterRequest: body.id.letterRequest,
      numberRequest: body.id.numberRequest,
    })
  )
    return c.json(
      { message: "A request with these parameters already exists" },
      400
    );

  await requestController.create({
    city: body.id.city,
    letterRequest: body.id.letterRequest,
    numberRequest: body.id.numberRequest,
  });
  return c.json(
    {
      message: `Request ${body.id.city}-${body.id.letterRequest}-${body.id.numberRequest} was created successfully`,
    },
    200
  );
});
