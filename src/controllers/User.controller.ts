import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/data-source';

class UserController {
  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  async getById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async getByEmail(email: string) {
    return prisma.user.findFirst({ where: { email } });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}

export default UserController;
