import fs from 'fs'

const cityFilepath: string = 'src/utils/cities.txt'

interface CityData {
  id: string
  name: string
}

/**
 * Parses a single line of text into a CityData object.
 *
 * @param line - A line of text from the cities file, formatted as "ID - Name, Municipality".
 * @returns A CityData object if parsing is successful, or null if the line is invalid.
 */
function parseSingleCity(line: string): CityData | null {
  // Splits "ID - Name, Municipality" into into id and name, discarding the municipality as it is not needed
  const [id, place] = line.split(' - ')
  const name = place.split(', ')[0]
  if (!id || !name) {
    return null
  }
  return { id, name }
}

async function createCitiesJson(filePath: string) {
  try {
    const rawCityData = await fs.promises.readFile(filePath, 'utf8')
    const cityDataArray = rawCityData.split('\n')

    // Parse each line into CityData objects, filtering out invalid lines where either id or name is null
    const cities: CityData[] = cityDataArray
      .map(parseSingleCity)
      .filter(Boolean) as CityData[]

    const jsonContent = JSON.stringify(cities, null, 2)

    fs.writeFileSync('cityData.json', jsonContent)

    console.log('JSON data written to cities.json')
  } catch (error) {
    console.error('Error reading or processing city data:', error)
  }
}

createCitiesJson(cityFilepath)
