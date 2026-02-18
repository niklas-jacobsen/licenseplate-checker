import { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/data-source'
import type { ExecutionStatus } from '@prisma/client'

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

  async getPublishedByCity(cityId: string) {
    return prisma.workflow.findMany({
      where: { cityId, isPublished: true },
      select: {
        id: true,
        name: true,
        description: true,
        cityId: true,
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async countByAuthor(authorId: string) {
    return prisma.workflow.count({
      where: { authorId },
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

  async createExecution(
    workflowId: string,
    checkId?: string,
  ) {
    return prisma.workflowExecution.create({
      data: {
        workflowId,
        checkId,
        status: 'PENDING',
      },
    })
  }

  async updateExecution(
    executionId: string,
    data: {
      status: ExecutionStatus
      logs?: Prisma.InputJsonValue
      result?: Prisma.InputJsonValue
      errorNodeId?: string
      triggerRunId?: string
      duration?: number
      finishedAt?: Date
    }
  ) {
    return prisma.workflowExecution.update({
      where: { id: executionId },
      data,
    })
  }

  async getExecution(executionId: string) {
    return prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        workflow: true,
        check: true,
      },
    })
  }
}

export default WorkflowController
