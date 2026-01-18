-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('UNCHECKED', 'AVAILABLE', 'RESERVED', 'NOT_AVAILABLE', 'ERROR_DURING_CHECK');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "Salutation" AS ENUM ('HERR', 'FRAU', 'FIRMA', 'VEREIN', 'JURISTISCHE_PERSON');

-- CreateTable
CREATE TABLE "CityAbbreviation" (
    "id" VARCHAR(3) NOT NULL,
    "name" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "allowedDomains" TEXT[],

    CONSTRAINT "CityAbbreviation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "definition" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "cityId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salutation" "Salutation",
    "firstname" TEXT,
    "lastname" TEXT,
    "birthdate" TIMESTAMP(3),
    "street" TEXT,
    "streetNumber" TEXT,
    "zipcode" INTEGER,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseplateCheck" (
    "id" TEXT NOT NULL,
    "cityId" VARCHAR(3) NOT NULL,
    "letters" VARCHAR(2) NOT NULL,
    "numbers" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CheckStatus" NOT NULL DEFAULT 'UNCHECKED',
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseplateCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowExecution" (
    "id" TEXT NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "logs" JSONB,
    "resultSummary" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "workflowId" TEXT NOT NULL,
    "checkId" TEXT,

    CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_cityId_name_authorId_key" ON "Workflow"("cityId", "name", "authorId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseplateCheck_cityId_letters_numbers_userId_key" ON "LicenseplateCheck"("cityId", "letters", "numbers", "userId");

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "CityAbbreviation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseplateCheck" ADD CONSTRAINT "LicenseplateCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseplateCheck" ADD CONSTRAINT "LicenseplateCheck_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "CityAbbreviation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES "LicenseplateCheck"("id") ON DELETE SET NULL ON UPDATE CASCADE;
