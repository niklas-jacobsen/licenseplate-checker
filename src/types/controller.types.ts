import LicenseplateRequestController from '../controllers/LicensePlateRequest.controller';
import CityController from '../controllers/City.controller';

export const controllerTypes = [
  LicenseplateRequestController,
  CityController,
] as const;

// Export the type for reuse
export type ControllerTypes = InstanceType<(typeof controllerTypes)[number]>;
