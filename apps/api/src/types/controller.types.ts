import CityController from '../controllers/City.controller'
import LicenseplateRequestController from '../controllers/LicensePlateCheck.controller'

export const controllerTypes = [
  LicenseplateRequestController,
  CityController,
] as const

// Export the type for reuse
export type ControllerTypes = InstanceType<(typeof controllerTypes)[number]>
