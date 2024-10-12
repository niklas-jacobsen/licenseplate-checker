import { prisma } from "../../prisma/data-source";
import { LicensePlateRequestType } from "./licensePlateRequest.controller";

export type LicensePlateQueryType = { id: string } & LicensePlateRequestType;
