import { CheckStatus } from '@prisma/client'
import { prisma } from '../../prisma/data-source'

export interface LicensePlateCheckInput {
  cityId: string
  letters: string
  numbers: number
  userId: string
}

class LicenseplateCheckController {
  // Creates new check for a specific license plate
  async createCheck(data: LicensePlateCheckInput) {
    try {
      await prisma.cityAbbreviation.findFirstOrThrow({
        where: { id: data.cityId },
      })

      return await prisma.licenseplateCheck.create({
        data: {
          city: {
            connect: { id: data.cityId },
          },
          letters: data.letters,
          numbers: data.numbers,
          user: {
            connect: { id: data.userId },
          },
        },
        include: {
          user: true,
          city: true,
        },
      })
    } catch (error) {
      console.error('Error creating license plate check:', error)
      throw error
    }
  }

  async getById(id: string) {
    return prisma.licenseplateCheck.findUnique({
      where: { id },
      include: {
        city: true,
        executions: true, // Send recent automation runs with query
      },
    })
  }

  async getByUserId(userId: string) {
    return prisma.licenseplateCheck.findMany({
      where: { userId },
      include: {
        city: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async updateStatus(id: string, status: CheckStatus) {
    return prisma.licenseplateCheck.update({
      where: { id },
      data: {
        status: status,
        lastCheckedAt: new Date(),
      },
    })
  }

  async deleteCheck(id: string) {
    return prisma.licenseplateCheck.delete({
      where: { id },
    })
  }
}

export default LicenseplateCheckController
