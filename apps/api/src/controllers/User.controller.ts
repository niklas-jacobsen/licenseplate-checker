import { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/data-source'

class UserController {
  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data })
  }

  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        licenseplateChecks: {
          include: { city: true },
        },
        createdWorkflows: true,
      },
    })
  }

  async getByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data })
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } })
  }

  async getDashboardData(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        email: true,
        firstname: true,
        lastname: true,
        licenseplateChecks: {
          orderBy: { updatedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            licenseplateChecks: true,
            createdWorkflows: true,
          },
        },
      },
    })
  }
}

export default UserController
