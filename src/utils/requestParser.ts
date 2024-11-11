import { zRequestScheme } from '../validators/zodSchemes';
import LicenseplateRequestController, {
  LicensePlateRequestType,
} from '../controllers/LicensePlateRequest.controller';
import { LicensePlateQueryType } from '../controllers/LicensePlateQuery.controller';
import { z } from 'zod';

export async function checkDataEntryAlreadyExists(
  controller: LicenseplateRequestController,
  body: LicensePlateRequestType | LicensePlateQueryType
): Promise<boolean> {
  if (
    await controller.getById({
      city: body.city,
      letters: body.letters,
      numbers: body.numbers,
    })
  )
    return true;

  return false;
}

export async function generateQueriesFromRequest(
  request: z.infer<typeof zRequestScheme>
) {}

// // Function to generate combinations based on the rules
// function generateCombinations(input: string, isNumber: boolean): string[] {
//   if (input.includes("*")) {
//     // Handle wildcard for letters and numbers
//     const combinations: string[] = [];
//     const length = isNumber ? 4 : 2; // Length for numbers is max 4 digits
//     const range = isNumber
//       ? [...Array(9999).keys()].slice(1)
//       : Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

//     for (let i = 0; i < range.length; i++) {
//       for (let j = 0; j < range.length; j++) {
//         combinations.push(`${range[i]}${range[j]}`); // For letters
//         if (isNumber) {
//           combinations.push(`${range[i]}`); // For numbers
//         }
//       }
//     }
//     return combinations;
//   } else {
//     return input
//       .split("?")
//       .flatMap((part) =>
//         part.length === 0
//           ? []
//           : isNumber
//           ? part.split("").map((n) => n)
//           : part.split("").map((l) => l)
//       );
//   }
// }

// // Main function to handle the request
// function handleRequest(request: {
//   city: string;
//   letters: string;
//   numbers: string;
// }) {
//   // Validate the incoming request
//   const validation = requestSchema.safeParse(request);
//   if (!validation.success) {
//     console.error("Request is invalid:", validation.error.errors);
//     return;
//   }

//   const { city, letters, numbers } = request;

//   // Generate combinations
//   const letterCombinations = generateCombinations(letters, false);
//   const numberCombinations = generateCombinations(numbers, true).map(Number);

//   // Create separate requests
//   const requests = letterCombinations.flatMap((letter) =>
//     numberCombinations.map((number) => ({
//       city,
//       letters: letter,
//       numbers: number,
//     }))
//   );

//   // Here you can send these requests to the database
//   console.log("Generated requests:", requests);
//   // Example: await sendRequestsToDatabase(requests);
// }

// // Example request
// handleRequest({ city: "DO", letters: "B?", numbers: "48?" });
