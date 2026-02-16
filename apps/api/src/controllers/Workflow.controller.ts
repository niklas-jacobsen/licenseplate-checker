import { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/data-source'

class WorkflowController {
  async create(
    name: string,
    cityId: string,
    authorId: string,
    definition: Prisma.InputJsonValue,
    description?: string
  ) {
    return prisma.workflow.create({
      data: {
        name,
        cityId,
        authorId,
        definition,
        description,
      },
    })
  }

  async getById(id: string) {
    return prisma.workflow.findUnique({
      where: { id },
      include: {
        city: true,
        author: {
          select: {
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    })
  }

  async getByCity(cityId: string) {
    return prisma.workflow.findMany({
      where: { cityId },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async updateDefinition(id: string, definition: Prisma.InputJsonValue) {
    return prisma.workflow.update({
      where: { id },
      data: {
        definition,
        updatedAt: new Date(),
      },
    })
  }

  async publish(id: string, isPublished: boolean) {
    return prisma.workflow.update({
      where: { id },
      data: { isPublished },
    })
  }

  async delete(id: string) {
    return prisma.workflow.delete({
      where: { id },
    })
  }

  async logExecution(
    workflowId: string,
    checkId: string,
    status: 'SUCCESS' | 'FAILED',
    logs: Prisma.InputJsonValue,
    resultSummary?: string
  ) {
    return prisma.workflowExecution.create({
      data: {
        workflowId,
        checkId,
        status,
        logs,
        resultSummary,
        finishedAt: new Date(),
      },
    })
  }
}

export default WorkflowController
