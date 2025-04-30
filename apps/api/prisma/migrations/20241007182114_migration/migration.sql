-- CreateEnum
CREATE TYPE "Status" AS ENUM ('UNCHECKED', 'NOT_AVAILABLE', 'AVAILABLE', 'RESERVED');

-- CreateEnum
CREATE TYPE "Salutation" AS ENUM ('HERR', 'FRAU', 'FIRMA', 'VEREIN', 'JURISTISCHE_PERSON');

-- CreateTable
CREATE TABLE "NumberplateRequest" (
    "id" SERIAL NOT NULL,
    "city" VARCHAR(3) NOT NULL DEFAULT 'MS',
    "letters" VARCHAR(2) NOT NULL,
    "numbers" VARCHAR(4) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'UNCHECKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "NumberplateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestParams" (
    "id" TEXT NOT NULL,
    "salutation" "Salutation" NOT NULL DEFAULT 'HERR',
    "lastname" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "street" TEXT NOT NULL,
    "streetNumber" TEXT NOT NULL,
    "zipcode" INTEGER NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "RequestParams_pkey" PRIMARY KEY ("id")
);
