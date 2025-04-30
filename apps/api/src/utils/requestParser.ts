import { z } from 'zod'
import { CityType } from '../controllers/City.controller'
import { LicensePlateQueryType } from '../controllers/LicensePlateQuery.controller'
import { LicensePlateRequestType } from '../controllers/LicensePlateRequest.controller'
import { ControllerTypes } from '../types/controller.types'
import { zRequestScheme } from '../validators/zodSchemes'

/**
 * This function is supposed to be able to handle existing data checks for every database table by
 * using dependency injection to pass a controller together with its types and functions into this function.
 * It has partly been commented out, as it is currently non-functioning but will soon be revisited
 * which is why it has not been removed.
 * */
export async function checkEntryExists(
  _controller: ControllerTypes,
  _body: LicensePlateRequestType | LicensePlateQueryType | CityType
): Promise<boolean> {
  // if (
  //   await controller.getById({
  //     city: body.city,
  //     letters: body.letters,
  //     numbers: body.numbers,
  //     user
  //   })
  // )
  return true
}

/**
 * Function should:
 * - Create atomic queries from wildcard request patterns.
 * - When should this trigger?
 * - For every generated query, before adding it to the DB, check if another requests already covers this query
 * - If a request is deleted, this should trigger again so that queries covered by the deleted request are then added to the next request covering them
 * -
 * */
export async function generateQueriesFromRequest(
  _request: z.infer<typeof zRequestScheme>
) {
  //TODO
}
