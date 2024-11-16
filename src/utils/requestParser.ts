import { zRequestScheme } from '../validators/zodSchemes';
import { ControllerTypes } from '../types/controller.types';
import { LicensePlateRequestType } from '../controllers/LicensePlateRequest.controller';
import { LicensePlateQueryType } from '../controllers/LicensePlateQuery.controller';
import { z } from 'zod';
import { CityType } from '../controllers/City.controller';

/**
 * This function is supposed to be able to handle existing data checks for every database table by
 * using dependency injection to pass a controller together with its types and functions into this function.
 * It has partly been commented out, as it is currently non-functioning but will soon be revisited
 * which is why it has not been removed.
 * */
export async function checkEntryExists(
  controller: ControllerTypes,
  body: LicensePlateRequestType | LicensePlateQueryType | CityType
): Promise<boolean> {
  // if (
  //   await controller.getById({
  //     city: body.city,
  //     letters: body.letters,
  //     numbers: body.numbers,
  //     user
  //   })
  // )
  return true;
}

export async function generateQueriesFromRequest(
  request: z.infer<typeof zRequestScheme>
) {}
