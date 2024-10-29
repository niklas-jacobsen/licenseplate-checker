import { chromium } from "@playwright/test";

export async function performRequest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const baseURL = "https://www.stadt-muenster.de";
  const formPath = "/kfz/kennzeichen/wkz-reservieren";

  const buttonSelectors = {
    rejectCookies: "a.cmpboxbtnno",
    startForm: "button#action_infopage_next",
    confirmPlateType: "button#action_choiceakztype_next",
  };

  await page.goto(baseURL + formPath);

  //Wait for the page to fully load
  await page.waitForLoadState("domcontentloaded");

  //Cookie banner appears after a delay, additional timeout required
  await page.waitForTimeout(1000);

  //If the reject button exists, click it
  const rejectButton = await page.$(buttonSelectors.rejectCookies);
  if (rejectButton) {
    console.log("Cookie banner found, rejecting cookies...");
    await rejectButton.click();
  } else {
    console.log("No cookie banner found.");
  }

  await page.waitForTimeout(1000);

  //Wait for the iframe to load
  const iframeSelector = "iframe";
  await page.waitForSelector(iframeSelector);
  const frameHandle = await page.$(iframeSelector);

  //Get the content frame
  const frame = await frameHandle?.contentFrame();
  if (!frame) {
    console.log("Iframe not found");
    await browser.close();
    return;
  }

  //const toggleLinkSelector = "a#ctrl_toggle_link";
  //await frame.click(toggleLinkSelector);
  //await page.waitForTimeout(1000);

  //const showInfoButtonSelector = "button#show_info";
  //await frame.click(showInfoButtonSelector);

  //await page.waitForTimeout(1000);

  //const newIframeSelector = "iframe";
  //await page.waitForSelector(newIframeSelector);
  //const newFrameHandle = await page.$(newIframeSelector);
  //const newFrame = await newFrameHandle?.contentFrame();

  //if (!newFrame) {
  // console.log("New iframe not found");
  // await browser.close();
  // return;
  //}

  //const versionDivSelector = "div.mdg_row";
  //const expectedVersion = "3.3.6";

  //const versionRow = await newFrame.$(versionDivSelector);
  //if (versionRow) {
  // const versionText = await versionRow.innerText();
  // const versionMatch = versionText.match(/Version:\s*(.*)/);

  // if (versionMatch && versionMatch[1]) {
  //   const actualVersion = versionMatch[1].trim();
  //   console.log(`Detected version: ${actualVersion}`);

  //   if (actualVersion !== expectedVersion) {
  //     console.error(
  //       `Version mismatch: expected ${expectedVersion}, but found ${actualVersion}. Cancelling script.`
  //     );
  //     //await browser.close();
  //     console.error("Browser would close");
  //     return;
  //   } else {
  //     console.log(`Version match confirmed: ${actualVersion}`);
  //   }
  // } else {
  //   console.error("Version number not found in the expected format.");
  //   //await browser.close();
  //   console.error("Browser would close");
  //   return;
  // }
  //} else {
  // console.error("Version information row not found.");
  // //await browser.close();
  // console.error("Browser would close");
  //  return;
  //}

  //Click the first "Weiter" button inside the iframe
  const firstWeiterButton = await frame.$(buttonSelectors.startForm);

  if (firstWeiterButton) {
    await firstWeiterButton.click();
    console.log("Start Form button clicked");
    await page.waitForTimeout(2000);
  } else {
    console.log("Start Form button not found in iframe");
  }

  //Now click the second "Weiter" button inside the same or different iframe if needed
  const secondWeiterButton = await frame.$(buttonSelectors.confirmPlateType);

  if (secondWeiterButton) {
    await secondWeiterButton.click();
    console.log("Confirm plate type button clicked");
  } else {
    console.log("Confirm plate type button not found in iframe");
  }

  await page.waitForTimeout(3000);

  await browser.close();
}

performRequest();
