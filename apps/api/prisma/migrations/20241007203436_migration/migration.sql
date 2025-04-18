/*
  Warnings:

  - The primary key for the `NumberplateRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `expiresAt` on the `NumberplateRequest` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `NumberplateRequest` table. All the data in the column will be lost.
  - You are about to drop the column `letters` on the `NumberplateRequest` table. All the data in the column will be lost.
  - You are about to drop the column `numbers` on the `NumberplateRequest` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `NumberplateRequest` table. All the data in the column will be lost.
  - Added the required column `letterRequest` to the `NumberplateRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberRequest` to the `NumberplateRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('UNCHECKED', 'CHECKED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('NOT_AVAILABLE', 'AVAILABLE', 'RESERVED');

-- AlterTable
ALTER TABLE "NumberplateRequest" DROP CONSTRAINT "NumberplateRequest_pkey",
DROP COLUMN "expiresAt",
DROP COLUMN "id",
DROP COLUMN "letters",
DROP COLUMN "numbers",
DROP COLUMN "status",
ADD COLUMN     "ckeckstatus" "CheckStatus" NOT NULL DEFAULT 'UNCHECKED',
ADD COLUMN     "letterRequest" VARCHAR(2) NOT NULL,
ADD COLUMN     "numberRequest" VARCHAR(4) NOT NULL,
ADD CONSTRAINT "NumberplateRequest_pkey" PRIMARY KEY ("city", "letterRequest", "numberRequest");

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "NumberplateResults" (
    "city" VARCHAR(3) NOT NULL,
    "letters" VARCHAR(2) NOT NULL,
    "numbers" INTEGER NOT NULL,
    "reservationStatus" "ReservationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "NumberplateResults_pkey" PRIMARY KEY ("city","letters","numbers")
);
