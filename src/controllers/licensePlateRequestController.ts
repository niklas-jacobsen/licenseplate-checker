import { CheckStatus, Prisma } from "@prisma/client";
import { prisma } from "../../prisma/data-source";

class licenseplateRequestController {
  async create(data: Prisma.LicenseplateRequestCreateInput) {
    return prisma.licenseplateRequest.create({ data });
  }

  async getById(id: {
    city: string;
    letterRequest: string;
    numberRequest: string;
  }) {
    return prisma.licenseplateRequest.findUnique({
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
    return prisma.licenseplateRequest.update({
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
  //     return prisma.licenseplateRequest.delete({ where: { id } });
  //   }
}

export default licenseplateRequestController;
