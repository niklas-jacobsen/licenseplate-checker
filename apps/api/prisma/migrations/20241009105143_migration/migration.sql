/*
  Warnings:

  - You are about to drop the `LicenseplateResults` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `RequestParams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RequestParams" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "LicenseplateResults";

-- CreateTable
CREATE TABLE "LicenseplateQueries" (
    "id" TEXT NOT NULL,
    "city" VARCHAR(3) NOT NULL,
    "letters" VARCHAR(2) NOT NULL,
    "numbers" INTEGER NOT NULL,
    "reservationStatus" "ReservationStatus" NOT NULL,
    "expiresOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseplateQueries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LicenseplateQueries_id_city_letters_numbers_key" ON "LicenseplateQueries"("id", "city", "letters", "numbers");
