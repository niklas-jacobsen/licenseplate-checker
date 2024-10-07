import { CheckStatus, Prisma } from "@prisma/client";
import { prisma } from "../../prisma/data-source";

class numberplateRequestController {
  async create(data: Prisma.NumberplateRequestCreateInput) {
    return prisma.numberplateRequest.create({ data });
  }

  async getById(id: {
    city: string;
    letterRequest: string;
    numberRequest: string;
  }) {
    return prisma.numberplateRequest.findUnique({
      where: {
        city_letterRequest_numberRequest: {
          city: id.city,
          letterRequest: id.letterRequest,
          numberRequest: id.numberRequest,
        },
      },
    });
  }

  async updateRequestStatus(
    id: {
      city: string;
      letterRequest: string;
      numberRequest: string;
    },
    checkstatus: CheckStatus
  ) {
    return prisma.numberplateRequest.update({
      where: {
        city_letterRequest_numberRequest: {
          city: id.city,
          letterRequest: id.letterRequest,
          numberRequest: id.numberRequest,
        },
      },
      data: {
        checkstatus: checkstatus,
      },
    });
  }

  //   async delete(id: string) {
  //     return prisma.numberplateRequest.delete({ where: { id } });
  //   }
}

export default numberplateRequestController;
