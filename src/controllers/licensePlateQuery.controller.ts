import { prisma } from '../../prisma/data-source';
import { LicensePlateRequestType } from './LicensePlateRequest.controller';

export type LicensePlateQueryType = { id: string } & LicensePlateRequestType;
