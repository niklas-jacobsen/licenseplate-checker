/*
  Warnings:

  - You are about to drop the `NumberplateRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NumberplateResults` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "NumberplateRequest";

-- DropTable
DROP TABLE "NumberplateResults";

-- CreateTable
CREATE TABLE "LicenseplateRequest" (
    "city" VARCHAR(3) NOT NULL DEFAULT 'MS',
    "letterRequest" VARCHAR(2) NOT NULL,
    "numberRequest" VARCHAR(4) NOT NULL,
    "checkstatus" "CheckStatus" NOT NULL DEFAULT 'UNCHECKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseplateRequest_pkey" PRIMARY KEY ("city","letterRequest","numberRequest")
);

-- CreateTable
CREATE TABLE "LicenseplateResults" (
    "city" VARCHAR(3) NOT NULL,
    "letters" VARCHAR(2) NOT NULL,
    "numbers" INTEGER NOT NULL,
    "reservationStatus" "ReservationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "LicenseplateResults_pkey" PRIMARY KEY ("city","letters","numbers")
);
