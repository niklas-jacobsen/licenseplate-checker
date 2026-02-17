import { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/data-source'

export interface CityType {
  id: string
  name: string
  websiteUrl?: string
  allowedDomains?: string[]
}

class CityController {
  async create(data: Prisma.CityAbbreviationCreateInput) {
    return prisma.cityAbbreviation.create({ data })
  }

  async getAll() {
    return prisma.cityAbbreviation.findMany({
      where: {
        isPublic: true,
      },
      include: {
        workflows: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async getById(cityId: string) {
    return prisma.cityAbbreviation.findUnique({
      where: {
        id: cityId,
        isPublic: true,
      },
      include: {
        workflows: true,
      },
    })
  }

  async updateWebsiteUrl(cityId: string, websiteUrl: string) {
    return prisma.cityAbbreviation.update({
      where: { id: cityId },
      data: { websiteUrl },
    })
  }

  async updateAllowedDomains(cityId: string, allowedDomains: string[]) {
    return prisma.cityAbbreviation.update({
      where: { id: cityId },
      data: { allowedDomains },
    })
  }
}

export default CityController
