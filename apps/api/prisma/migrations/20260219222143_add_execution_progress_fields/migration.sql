-- AlterTable
ALTER TABLE "WorkflowExecution" ADD COLUMN     "completedNodes" JSONB,
ADD COLUMN     "currentNodeId" TEXT;
