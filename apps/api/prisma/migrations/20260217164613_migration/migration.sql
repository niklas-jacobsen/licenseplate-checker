/*
  Warnings:

  - You are about to drop the column `resultSummary` on the `WorkflowExecution` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LicenseplateCheck" ADD COLUMN     "cron" TEXT,
ADD COLUMN     "workflowId" TEXT;

-- AlterTable
ALTER TABLE "WorkflowExecution" DROP COLUMN "resultSummary",
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "errorNodeId" TEXT,
ADD COLUMN     "inngestId" TEXT,
ADD COLUMN     "result" JSONB;

-- CreateIndex
CREATE INDEX "WorkflowExecution_workflowId_startedAt_idx" ON "WorkflowExecution"("workflowId", "startedAt");

-- AddForeignKey
ALTER TABLE "LicenseplateCheck" ADD CONSTRAINT "LicenseplateCheck_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
