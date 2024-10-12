import fs from "fs";

const cityFilepath: string = "src/utils/cities.txt";

interface CityData {
  id: string;
  name: string;
}

function parseCityData(line: string): CityData | null {
  const [id, place] = line.split(" - ");
  const [name, _municipality] = place.split(", ");
  if (!id || !name) {
    return null;
  }
  return { id, name };
}

async function createCitiesJson(filePath: string) {
  try {
    const data = await fs.promises.readFile(filePath, "utf8");
    const lines = data.split("\n");

    const cities: CityData[] = lines
      .map(parseCityData)
      .filter(Boolean) as CityData[];

    const jsonContent = JSON.stringify(cities, null, 2);

    fs.writeFileSync("cityData.json", jsonContent);

    console.log("JSON data written to cities.json");
  } catch (error) {
    console.error("Error reading or processing city data:", error);
  }
}

// Replace 'city_data.txt' with the actual path to your text file
createCitiesJson(cityFilepath);
