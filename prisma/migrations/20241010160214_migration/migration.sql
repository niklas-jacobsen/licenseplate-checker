/*
  Warnings:

  - You are about to drop the `LicenseplateQueries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestParams` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "LicenseplateQueries";

-- DropTable
DROP TABLE "RequestParams";

-- CreateTable
CREATE TABLE "CityAbbreviation" (
    "id" VARCHAR(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CityAbbreviation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseplateQuery" (
    "id" TEXT NOT NULL,
    "city" VARCHAR(3) NOT NULL,
    "letters" VARCHAR(2) NOT NULL,
    "numbers" INTEGER NOT NULL,
    "reservationStatus" "ReservationStatus" NOT NULL,
    "expiresOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseplateQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestBody" (
    "id" TEXT NOT NULL,
    "salutation" "Salutation" NOT NULL DEFAULT 'HERR',
    "lastname" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "street" TEXT NOT NULL,
    "streetNumber" TEXT NOT NULL,
    "zipcode" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestBody_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LicenseplateQuery_id_city_letters_numbers_key" ON "LicenseplateQuery"("id", "city", "letters", "numbers");

-- AddForeignKey
ALTER TABLE "LicenseplateRequest" ADD CONSTRAINT "LicenseplateRequest_city_fkey" FOREIGN KEY ("city") REFERENCES "CityAbbreviation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseplateQuery" ADD CONSTRAINT "LicenseplateQuery_city_fkey" FOREIGN KEY ("city") REFERENCES "CityAbbreviation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
