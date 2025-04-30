/*
  Warnings:

  - Added the required column `userId` to the `LicenseplateRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LicenseplateRequest" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "salutation" DROP NOT NULL,
ALTER COLUMN "firstname" DROP NOT NULL,
ALTER COLUMN "lastname" DROP NOT NULL,
ALTER COLUMN "birthdate" DROP NOT NULL,
ALTER COLUMN "street" DROP NOT NULL,
ALTER COLUMN "streetNumber" DROP NOT NULL,
ALTER COLUMN "zipcode" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "LicenseplateRequest" ADD CONSTRAINT "LicenseplateRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseplateRequest" ADD CONSTRAINT "LicenseplateRequest_city_fkey" FOREIGN KEY ("city") REFERENCES "CityAbbreviation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
