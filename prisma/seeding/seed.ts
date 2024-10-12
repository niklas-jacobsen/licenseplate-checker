import CityDataController from "../../src/controllers/cityData.controller";
import { prisma } from "../data-source";
import { cityData } from "./cityData";

const cityDataController = new CityDataController();

async function seedCityData() {
  try {
    for (const city of cityData) {
      const cityExists = await prisma.cityAbbreviation.findFirst({
        where: { id: city.id, name: city.name },
      });
      if (!cityExists) {
        cityDataController.create({
          id: city.id,
          name: city.name,
        });
      }
    }
  } catch (error) {
    console.error("Error seeding software:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCityData();
