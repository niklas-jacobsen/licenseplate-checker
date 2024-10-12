import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/data-source";

export interface CityDataType {
  id: string;
  name: string;
}

class CityDataController {
  async create(data: Prisma.CityAbbreviationCreateInput) {
    return prisma.cityAbbreviation.create({ data });
  }
}

export default CityDataController;
