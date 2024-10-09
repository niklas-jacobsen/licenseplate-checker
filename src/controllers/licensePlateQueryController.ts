import { prisma } from "../../prisma/data-source";
import { LicensePlateRequestType } from "./licensePlateRequestController";

export type LicensePlateQueryType = { id: string } & LicensePlateRequestType;
