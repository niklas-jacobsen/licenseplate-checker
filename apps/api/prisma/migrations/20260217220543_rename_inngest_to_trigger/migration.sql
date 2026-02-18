/*
  Warnings:

  - You are about to drop the column `inngestId` on the `WorkflowExecution` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkflowExecution" DROP COLUMN "inngestId",
ADD COLUMN     "triggerRunId" TEXT;
