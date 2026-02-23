import { CheckStatus } from '@prisma/client'
import { prisma } from '../../prisma/data-source'

export interface LicensePlateCheckInput {
  cityId: string
  letters: string
  numbers: number
  userId: string
  workflowId?: string
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
          ...(data.workflowId && {
            workflow: { connect: { id: data.workflowId } },
          }),
        },
        include: {
          user: true,
          city: true,
          workflow: true,
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
        workflow: true,
        executions: true, // Send recent automation runs with query
      },
    })
  }

  async getByUserId(userId: string) {
    return prisma.licenseplateCheck.findMany({
      where: { userId },
      include: {
        city: true,
        workflow: true,
        executions: {
          take: 1,
          orderBy: { startedAt: 'desc' },
        },
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

  async updateScheduleId(
    id: string,
    triggerScheduleId: string | null,
    scheduledHour?: number,
    scheduledMinute?: number
  ) {
    return prisma.licenseplateCheck.update({
      where: { id },
      data: {
        triggerScheduleId,
        scheduledHour: scheduledHour ?? null,
        scheduledMinute: scheduledMinute ?? null,
      },
    })
  }

  async assignWorkflow(id: string, workflowId: string) {
    return prisma.licenseplateCheck.update({
      where: { id },
      data: { workflow: { connect: { id: workflowId } } },
      include: { city: true, workflow: true, executions: { take: 1, orderBy: { startedAt: 'desc' } } },
    })
  }

  async deleteCheck(id: string) {
    return prisma.licenseplateCheck.delete({
      where: { id },
    })
  }
}

export default LicenseplateCheckController
