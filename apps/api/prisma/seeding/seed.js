import { ENV } from '../../src/env'
import { prisma } from '../data-source'
import { cityData } from './cityData'

const forceSeed = ENV.FORCE_SEED === 'true'

async function seedCityData() {
  console.log('Starting seeding script.')
  try {
    const existingCount = await prisma.cityAbbreviation.count()

    if (existingCount > 0 && !forceSeed) {
      console.log(
        `Data already exists (${existingCount} cities). Skipping seeding.`
      )
      return
    }

    let created = 0
    let updated = 0

    for (const city of cityData) {
      if (!city.id || !city.name) {
        console.warn(`Skipping invalid entry: ${JSON.stringify(city)}`)
        continue
      }

      const isPublic =
        !city.name.toLowerCase().includes('official') &&
        !city.name.toLowerCase().includes('government') &&
        !city.name.toLowerCase().includes('authority') &&
        !city.name.toLowerCase().includes('vehicles')

      const existing = await prisma.cityAbbreviation.findUnique({
        where: { id: city.id },
      })

      if (existing && !forceSeed) {
        continue
      }

      await prisma.cityAbbreviation.upsert({
        where: { id: city.id },
        update: {
          name: city.name,
          isPublic,
          ...(city.websiteUrl !== undefined && { websiteUrl: city.websiteUrl }),
          ...(city.allowedDomains !== undefined && {
            allowedDomains: city.allowedDomains,
          }),
        },
        create: {
          id: city.id,
          name: city.name,
          isPublic,
          websiteUrl: city.websiteUrl ?? null,
          allowedDomains: city.allowedDomains ?? [],
        },
      })

      existing ? updated++ : created++
    }

    console.log(
      `Database seeded successfully. Created: ${created}, Updated: ${updated}`
    )
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedCityData()
  .then(() => {
    console.log('Seeding script completed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error in seeding script:', error)
    process.exit(1)
  })
