// import { zRequestScheme } from '../validators/zodSchemes';
// import { ControllerTypes } from '../types/controller.types';
// import LicenseplateRequestController, {
//   LicensePlateRequestType,
// } from '../controllers/LicensePlateRequest.controller';
// import { LicensePlateQueryType } from '../controllers/LicensePlateQuery.controller';
// import { z } from 'zod';
// import { CityType } from '../controllers/City.controller';

// export async function checkEntryExists(
//   controller: ControllerTypes,
//   body: LicensePlateRequestType | LicensePlateQueryType | CityType
// ): Promise<boolean> {
//   if (
//     await controller.getById({
//       city: body.city,
//       letters: body.letters,
//       numbers: body.numbers,
//       user
//     })
//   )
//     return true;

//   return false;
// }

// export async function generateQueriesFromRequest(
//   request: z.infer<typeof zRequestScheme>
// ) {}
