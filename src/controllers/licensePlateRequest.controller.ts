import { CheckStatus, Prisma } from '@prisma/client';
import { prisma } from '../../prisma/data-source';

export interface LicensePlateRequestType {
  city: string;
  letters: string;
  numbers: string;
}

class LicenseplateRequestController {
  async createRequest(
    city: string,
    letterRequest: string,
    numberRequest: string,
    userId: string
  ) {
    try {
      const cityExists = await prisma.cityAbbreviation.findUniqueOrThrow({
        where: { id: city },
      });

      if (!cityExists) {
        return console.error('error');
      }

      return prisma.licenseplateRequest.create({
        data: {
          city: city,
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
        },
      });
    } catch (error) {
      console.error(error);
    }
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
