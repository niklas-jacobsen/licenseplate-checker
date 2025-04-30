-- AddForeignKey
ALTER TABLE "LicenseplateRequest" ADD CONSTRAINT "LicenseplateRequest_city_fkey" FOREIGN KEY ("city") REFERENCES "CityAbbreviation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
