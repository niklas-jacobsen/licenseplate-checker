/*
  Warnings:

  - The primary key for the `LicenseplateRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "LicenseplateRequest" DROP CONSTRAINT "LicenseplateRequest_pkey",
ADD CONSTRAINT "LicenseplateRequest_pkey" PRIMARY KEY ("city", "letterRequest", "numberRequest", "userId");
