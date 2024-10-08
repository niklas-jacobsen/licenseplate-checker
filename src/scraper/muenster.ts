import { chromium } from "@playwright/test";

export async function performRequest() {
  const browser = await chromium.launch({ headless: false }); // Set headless to false to see the browser in action
  const page = await browser.newPage();

  // Navigate to a webpage
  await page.goto(
    "https://www.stadt-muenster.de/kfz/kennzeichen/wkz-reservieren"
  );

  // Close the browser
  await browser.close();
}
