import { chromium } from '@playwright/test'

export async function performRequest() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  const baseURL = 'https://www.stadt-muenster.de'
  const formPath = '/kfz/kennzeichen/wkz-reservieren'

  const inputSelectors = {
    rejectCookies: 'a.cmpboxbtnno',
    startForm: 'button#action_infopage_next',
    confirmPlateType: 'button#action_choiceakztype_next',
    lettersInput: 'input#akz_part2_id_wkzsuche_akzblockohnetreenormal',
    numbersInput: 'input#akz_part3_id_wkzsuche_akzblockohnetreenormal',
    searchButton: 'button#action_searchpage_next',
  }

  await page.goto(baseURL + formPath)

  //Wait for the page to fully load
  await page.waitForLoadState('domcontentloaded')

  //Cookie banner appears after a delay, additional timeout required
  await page.waitForTimeout(1000)

  //If the reject button exists, click it
  const rejectButton = await page.$(inputSelectors.rejectCookies)
  if (rejectButton) {
    console.log('Cookie banner found, rejecting cookies...')
    await rejectButton.click()
  } else {
    console.log('No cookie banner found.')
  }

  await page.waitForTimeout(1000)

  //Wait for the iframe to load
  const iframeSelector = 'iframe'
  await page.waitForSelector(iframeSelector)
  const frameHandle = await page.$(iframeSelector)

  //Get the content frame
  const frame = await frameHandle?.contentFrame()
  if (!frame) {
    console.log('Iframe not found')
    await browser.close()
    return
  }

  //Click the first "Weiter" button inside the iframe
  const firstWeiterButton = await frame.$(inputSelectors.startForm)

  if (firstWeiterButton) {
    await firstWeiterButton.click()
    console.log('Start Form button clicked')
    await page.waitForTimeout(1000)
  } else {
    console.log('Start Form button not found in iframe')
  }

  //Click the second "Weiter" button
  const secondWeiterButton = await frame.$(inputSelectors.confirmPlateType)

  if (secondWeiterButton) {
    await secondWeiterButton.click()
    console.log('Confirm plate type button clicked')
  } else {
    console.log('Confirm plate type button not found in iframe')
  }

  await page.waitForTimeout(1000)

  const lettersInput = await frame.locator(inputSelectors.lettersInput)
  await lettersInput.fill('DR')

  await page.waitForTimeout(1000)

  const numbersInput = await frame.locator(inputSelectors.numbersInput)
  await numbersInput.fill('3000')

  const searchButton = await frame.$(inputSelectors.searchButton)
  if (searchButton) {
    await searchButton.click()
    console.log('Search Form button clicked')
    await page.waitForTimeout(1000)
  } else {
    console.log('Search button not found in iframe')
  }

  await page.waitForTimeout(10000)

  await browser.close()
}

performRequest()
