import { Context, Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { zRequestScheme } from '../validators/zodSchemes';
import LicenseplateRequestController from '../controllers/LicensePlateRequest.controller';
import { checkDataEntryAlreadyExists } from '../utils/requestParser';
import auth from '../middleware/auth';

export const licensePlateRequestRouter = new Hono();
licensePlateRequestRouter.use(auth);

const requestController = new LicenseplateRequestController();

licensePlateRequestRouter.post(
  '/new',
  zValidator('json', zRequestScheme),
  auth,
  async (c: Context) => {
    const user = c.get('user');
    const body = await c.req.json();

    if (await checkDataEntryAlreadyExists(requestController, body)) {
      return c.json(
        {
          message: 'A request with these parameters already exists',
        },
        400
      );
    }

    const request = {
      city: body.city,
      letterRequest: body.letters,
      numberRequest: body.numbers,
      user: user,
    };

    await requestController.createRequest(
      request.city,
      request.letterRequest,
      request.numberRequest,
      request.user
    );

    return c.json(
      {
        message: `Request ${body.city}-${body.letters}-${body.numbers} was created successfully`,
      },
      200
    );
  }
);
