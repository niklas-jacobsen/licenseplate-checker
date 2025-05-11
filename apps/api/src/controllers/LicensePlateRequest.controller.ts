import { CheckStatus } from '@prisma/client'
import { prisma } from '../../prisma/data-source'

export interface LicensePlateRequestType {
  city: string
  letters: string
  numbers: string
  user: string
}

class LicenseplateRequestController {
  async createRequest(
    city: string,
    letterRequest: string,
    numberRequest: string,
    userId: string
  ) {
    try {
      const cityExists = await prisma.cityAbbreviation.findFirstOrThrow({
        where: { id: city },
      })

      if (!cityExists) {
        return new Error()
      }

      return prisma.licenseplateRequest.create({
        data: {
          cityAbbreviation: {
            connect: {
              id: city,
            },
          },
          letterRequest: letterRequest,
          numberRequest: numberRequest,
          user: {
            connect: {
              id: userId,
            },
          },
        },
        include: {
          user: true,
          cityAbbreviation: true,
        },
      })
    } catch (error) {
      console.error(error)
    }
  }

  async getById(id: LicensePlateRequestType) {
    return prisma.licenseplateRequest.findUnique({
      where: {
        city_letterRequest_numberRequest_userId: {
          city: id.city,
          letterRequest: id.letters,
          numberRequest: id.numbers,
          userId: id.user,
        },
      },
    })
  }

  async getByUserId(userId: string) {
    return prisma.licenseplateRequest.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: true,
        cityAbbreviation: true,
      },
    })
  }

  async updateRequestStatus(
    id: {
      city: string
      letterRequest: string
      numberRequest: string
      user: string
    },
    checkstatus: CheckStatus
  ) {
    return prisma.licenseplateRequest.update({
      where: {
        city_letterRequest_numberRequest_userId: {
          city: id.city,
          letterRequest: id.letterRequest,
          numberRequest: id.numberRequest,
          userId: id.user,
        },
      },
      data: {
        checkstatus: checkstatus,
      },
    })
  }

  async deleteRequest(id: LicensePlateRequestType) {
    return prisma.licenseplateRequest.delete({
      where: {
        city_letterRequest_numberRequest_userId: {
          city: id.city,
          letterRequest: id.letters,
          numberRequest: id.numbers,
          userId: id.user,
        },
      },
    })
  }
}

export default LicenseplateRequestController
