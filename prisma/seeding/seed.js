import CityController from '../../src/controllers/City.controller';
import { prisma } from '../data-source';
import { cityData } from './cityData';

const forceSeed = process.env.FORCE_SEED === 'true';
const cityController = new CityController();

async function seedCityData() {
  console.log('Starting seeding script.');
  try {
    const existingCityData = await cityController.getAll();

    if (existingCityData.length > 0 && !forceSeed) {
      console.log('Data already exists. Skipping seeding.');
      return;
    }

    for (const city of cityData) {
      const cityExists = await prisma.cityAbbreviation.findFirst({
        where: { id: city.id, name: city.name },
      });
      if (!cityExists) {
        cityController.create({
          id: city.id,
          name: city.name,
        });
      }
    }
    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding software:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedCityData()
    .then(() => {
      console.log('Seeding script completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error in seeding script:', error);
      process.exit(1);
    });
}
