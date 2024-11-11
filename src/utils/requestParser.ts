import { zRequestScheme } from '../validators/zodSchemes';
import LicenseplateRequestController, {
  LicensePlateRequestType,
} from '../controllers/LicensePlateRequest.controller';
import { LicensePlateQueryType } from '../controllers/LicensePlateQuery.controller';
import { z } from 'zod';

export async function checkDataEntryAlreadyExists(
  controller: LicenseplateRequestController,
  body: LicensePlateRequestType | LicensePlateQueryType
): Promise<boolean> {
  if (
    await controller.getById({
      city: body.city,
      letters: body.letters,
      numbers: body.numbers,
    })
  )
    return true;

  return false;
}

export async function generateQueriesFromRequest(
  request: z.infer<typeof zRequestScheme>
) {}
