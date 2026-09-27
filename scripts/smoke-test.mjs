import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173/mosters-party/'
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const shots = 'test-results/original-rebuild'
await mkdir(shots, { recursive: true })

const browser = await chromium.launch({ executablePath: chrome, headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await context.newPage()
const errors = []
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
page.on('pageerror', (error) => errors.push(error.message))
page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`) })
page.on('requestfailed', (request) => { if (request.failure()?.errorText !== 'net::ERR_ABORTED') errors.push(`FAILED ${request.url()}`) })

const clickText = async (name) => page.getByRole('button', { name, exact: true }).click()
const audioFile = async (action) => {
  const request = page.waitForRequest((item) => item.url().toLowerCase().endsWith('.wav'))
  await action()
  return decodeURIComponent(new URL((await request).url()).pathname.split('/').pop())
}
const label = (monster) => `${monster[0].toUpperCase()}${monster.slice(1)}`

await page.goto(baseURL)
await page.screenshot({ path: `${shots}/01-title.png` })
await clickText('START')
await page.screenshot({ path: `${shots}/02-house.png` })
await clickText('NEXT')
await page.screenshot({ path: `${shots}/03-meet.png` })
await audioFile(() => page.getByRole('button', { name: 'Listen to Witch' }).click())
await clickText('NEXT')
await page.screenshot({ path: `${shots}/04-video.png` })
await clickText('NEXT')

for (let index = 0; index < 12; index += 1) {
  const deck = page.getByRole('button', { name: 'Draw and listen to a card' })
  const monster = await deck.getAttribute('data-target')
  await deck.click()
  await page.locator('.portrait-choices button', { has: page.locator(`img[alt="${label(monster)}"]`) }).click()
  await page.waitForTimeout(620)
}

await clickText('NEXT')
for (let index = 0; index < 6; index += 1) {
  const listen = page.getByRole('button', { name: 'LISTEN', exact: true })
  const monster = await listen.getAttribute('data-target')
  await listen.click()
  await page.locator('.feeling-cast button', { has: page.locator(`img[alt="${label(monster)}"]`) }).click()
  await page.waitForTimeout(560)
}

await clickText('NEXT')
await clickText('NEXT')
for (const button of await page.locator('.food-shelf button').all()) await button.click()
await clickText('NEXT')

const memory = await page.locator('.memory-grid button').evaluateAll((cards) => cards.map((card, index) => ({ index, pair: card.querySelector('img')?.alt || card.querySelector('b')?.textContent?.trim() })))
const groups = new Map()
for (const card of memory) groups.set(card.pair, [...(groups.get(card.pair) || []), card.index])
for (const pair of groups.values()) {
  await page.locator('.memory-grid button').nth(pair[0]).click()
  await page.locator('.memory-grid button').nth(pair[1]).click()
  await page.waitForTimeout(500)
}
await clickText('NEXT')
await clickText('NEXT')

for (let index = 0; index < 6; index += 1) {
  const listen = page.getByRole('button', { name: 'LISTEN', exact: true })
  const monster = await listen.getAttribute('data-target')
  await listen.click()
  await page.locator('.invitation-options button', { has: page.locator(`img[alt="${label(monster)}"]`) }).click()
  await page.waitForTimeout(120)
  await clickText(index === 5 ? 'GO TO THE RACE' : 'NEXT INVITATION')
}

await page.screenshot({ path: `${shots}/05-race-intro.png` })
await clickText('NEXT')
for (let round = 0; round < 9; round += 1) {
  const shared = await page.locator('.race-table').evaluate((table) => {
    const players = [...table.querySelectorAll('.race-player')]
    const left = [...players[0].querySelectorAll('img')].map((image) => image.getAttribute('src'))
    const right = [...players[1].querySelectorAll('img')].map((image) => image.getAttribute('src'))
    return left.find((source) => right.includes(source))
  })
  await page.locator(`.player-${round % 2 + 1} img[src="${shared}"]`).click()
  await page.waitForTimeout(570)
}
await clickText('NEXT')
await clickText('NEXT')
await clickText('NEXT')
await page.screenshot({ path: `${shots}/06-party.png` })

await page.reload()
await page.waitForLoadState('domcontentloaded')
if (await page.getByText("WELCOME TO THE", { exact: false }).count() !== 1) throw new Error('Final scene was not restored')
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('monsterPartyOriginalSave_v2')))
console.log(JSON.stringify({ errors, saved, screenshots: 6 }, null, 2))
await browser.close()
if (errors.length) process.exitCode = 1
