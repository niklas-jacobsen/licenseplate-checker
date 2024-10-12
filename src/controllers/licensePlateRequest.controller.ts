import { CheckStatus, Prisma } from "@prisma/client";
import { prisma } from "../../prisma/data-source";

export interface LicensePlateRequestType {
  city: string;
  letters: string;
  numbers: string;
}

class LicenseplateRequestController {
  async create(data: Prisma.LicenseplateRequestCreateInput) {
    return prisma.licenseplateRequest.create({ data });
  }

  async getById(id: LicensePlateRequestType) {
    return prisma.licenseplateRequest.findUnique({
      where: {
        city_letterRequest_numberRequest: {
          city: id.city,
          letterRequest: id.letters,
          numberRequest: id.numbers,
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

export default LicenseplateRequestController;
