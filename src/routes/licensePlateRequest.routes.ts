import { Context, Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { zRequestScheme } from '../validators/zodSchemes';
import LicenseplateRequestController from '../controllers/LicensePlateRequest.controller';
import auth from '../middleware/auth';
import CityController from '../controllers/City.controller';

export const licensePlateRequestRouter = new Hono();
licensePlateRequestRouter.use(auth);

const cityController = new CityController();
const requestController = new LicenseplateRequestController();

licensePlateRequestRouter.post(
  '/new',
  zValidator('json', zRequestScheme),
  auth,
  async (c: Context) => {
    try {
      const user = c.get('user');
      const body = await c.req.json();

      if (!(await cityController.getById(body.city))) {
        return c.json({ message: 'City does not exist' }, 400);
      }
      if (
        await requestController.getById({
          city: body.city,
          letters: body.letters,
          numbers: body.numbers,
          user,
        })
      ) {
        return c.json(
          {
            message: 'A request with these parameters already exists',
          },
          400
        );
      }

      const request = await requestController.createRequest(
        body.city,
        body.letters,
        body.numbers,
        user
      );

      if (!request) {
        return c.json({ message: 'Request could not be created' }, 400);
      }

      return c.json(
        {
          message: `Request ${body.city}-${body.letters}-${body.numbers} was created successfully`,
        },
        200
      );
    } catch (error) {
      return c.json(
        { message: 'An error occured when performing the request:', error },
        500
      );
    }
  }
);
