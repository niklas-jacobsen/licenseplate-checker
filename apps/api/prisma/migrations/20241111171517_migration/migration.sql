/*
  Warnings:

  - You are about to drop the `RequestBody` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `LicenseplateQuery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `LicenseplateRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LicenseplateQuery" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LicenseplateRequest" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "city" DROP DEFAULT;

-- DropTable
DROP TABLE "RequestBody";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "salutation" "Salutation" NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "street" TEXT NOT NULL,
    "streetNumber" TEXT NOT NULL,
    "zipcode" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "LicenseplateRequest" ADD CONSTRAINT "LicenseplateRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseplateRequest" ADD CONSTRAINT "LicenseplateRequest_city_fkey" FOREIGN KEY ("city") REFERENCES "CityAbbreviation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseplateQuery" ADD CONSTRAINT "LicenseplateQuery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseplateQuery" ADD CONSTRAINT "LicenseplateQuery_city_fkey" FOREIGN KEY ("city") REFERENCES "CityAbbreviation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
