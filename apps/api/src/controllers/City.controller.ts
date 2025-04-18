import { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/data-source'

export interface CityType {
  id: string
  name: string
}

class CityController {
  async create(data: Prisma.CityAbbreviationCreateInput) {
    return prisma.cityAbbreviation.create({ data })
  }

  async getAll() {
    return prisma.cityAbbreviation.findMany()
  }

  async getById(cityId: string) {
    return prisma.cityAbbreviation.findFirst({
      where: {
        id: cityId,
      },
    })
  }

  async getFullCity(cityId: string, name: string) {
    return prisma.cityAbbreviation.findFirst({
      where: {
        id: cityId,
        name: name,
      },
    })
  }
}

export default CityController
