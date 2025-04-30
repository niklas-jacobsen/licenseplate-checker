/*
  Warnings:

  - You are about to drop the column `ckeckstatus` on the `NumberplateRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NumberplateRequest" DROP COLUMN "ckeckstatus",
ADD COLUMN     "checkstatus" "CheckStatus" NOT NULL DEFAULT 'UNCHECKED';
