import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5173'
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const shots = 'test-results'
await mkdir(shots, { recursive: true })

const browser = await chromium.launch({ executablePath: chrome, headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 960 } })
const page = await context.newPage()
const errors = []
page.on('console', (message) => {
  if (message.type() !== 'error') return
  const location = message.location().url
  errors.push(location ? `${message.text()} @ ${location}` : message.text())
})
page.on('pageerror', (error) => errors.push(error.message))
page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`) })
page.on('requestfailed', (request) => {
  const reason = request.failure()?.errorText || 'unknown error'
  // Moving between rooms intentionally unloads each metadata-only video request.
  if (reason !== 'net::ERR_ABORTED') errors.push(`REQUEST FAILED ${request.url()} — ${reason}`)
})

const wavName = async (action) => {
  const request = page.waitForRequest((item) => item.url().toLowerCase().endsWith('.wav'))
  await action()
  return decodeURIComponent(new URL((await request).url()).pathname.split('/').pop())
}

const clickUnique = async (role, name) => {
  const locator = page.getByRole(role, { name, exact: true })
  if (await locator.count() !== 1) {
    const labels = await page.getByRole('button').allTextContents()
    throw new Error(`Expected one ${role} named ${name}; buttons: ${JSON.stringify(labels)}`)
  }
  await locator.click()
}

const finishAudioChoices = async (fileToAnswer, rounds, wrongChoices = ['Skeleton', 'Troll']) => {
  for (let index = 0; index < rounds; index += 1) {
    const name = await wavName(() => clickUnique('button', 'PLAY SOUND'))
    const answer = fileToAnswer(name)
    if (index === 0) {
      const wrong = answer === wrongChoices[0] ? wrongChoices[1] : wrongChoices[0]
      await clickUnique('button', wrong)
      await page.waitForTimeout(500)
    }
    await clickUnique('button', answer)
    await page.waitForTimeout(720)
  }
}

await page.goto(baseURL)
await page.screenshot({ path: `${shots}/01-start.png` })
await clickUnique('button', 'ENTER THE HOUSE')
await page.waitForTimeout(2900)
await page.screenshot({ path: `${shots}/02-hub.png` })

// Skeleton — original character voice identification, including wrong feedback.
await clickUnique('button', 'Enter Echo Bathroom')
await finishAudioChoices((file) => ({ 'skeleton.wav': 'Skeleton', 'troll.wav': 'Troll', 'witch.wav': 'Witch', 'vampire.wav': 'Vampire', 'ghost.wav': 'Ghost', 'raven.wav': 'Raven' })[file], 4)
await page.screenshot({ path: `${shots}/03-room-complete.png` })
await clickUnique('button', 'Back to house')

// Troll — room vocabulary.
await clickUnique('button', 'Enter Basement Workshop')
await finishAudioChoices((file) => file.replace('.wav', '').replace('-', ' '), 6, ['attic', 'basement'])
await clickUnique('button', 'Back to house')

// Witch — food vocabulary.
await clickUnique('button', 'Enter Witch Kitchen')
await finishAudioChoices((file) => file.replace('.wav', ''), 6, ['bacon', 'toast'])
await clickUnique('button', 'Back to house')

// Vampire — video gate and How are you challenge.
await clickUnique('button', 'Enter Moonlit Bedroom')
await clickUnique('button', 'I watched the clue')
await wavName(() => clickUnique('button', 'PLAY SOUND'))
await clickUnique('button', 'TIRED')
await page.waitForTimeout(650)
await clickUnique('button', 'Back to house')

// Ghost — match all six image/word pairs.
await clickUnique('button', 'Enter Memory Parlour')
const memory = await page.locator('.memory-card').evaluateAll((cards) => cards.map((card, index) => ({
  index,
  pair: card.querySelector('img')?.alt || card.querySelector('.card-face strong')?.textContent,
})))
const byPair = new Map()
for (const card of memory) byPair.set(card.pair, [...(byPair.get(card.pair) || []), card.index])
for (const pair of byPair.values()) {
  const cards = page.locator('.memory-card')
  await cards.nth(pair[0]).click()
  await cards.nth(pair[1]).click()
  await page.waitForTimeout(520)
}
await page.waitForTimeout(650)
await clickUnique('button', 'Back to house')

// Raven — invitation voices.
await clickUnique('button', 'Enter Raven Tower')
const invitations = ['TO SKELETON', 'TO TROLL', 'TO WITCH', 'TO VAMPIRE', 'TO GHOST', 'TO RAVEN']
for (let round = 0; round < 6; round += 1) {
  await clickUnique('button', 'PLAY SOUND')
  for (const invitation of invitations) {
    await clickUnique('button', invitation)
    await page.waitForTimeout(500)
    const advanced = round === 5
      ? await page.getByText('KEY PIECE FOUND!', { exact: true }).count()
      : await page.getByText(`CHALLENGE ${round + 2} / 6`, { exact: true }).count()
    if (advanced) break
  }
}

await page.getByRole('button', { name: 'ENTER THE MONSTER RACE', exact: true }).waitFor()
await clickUnique('button', 'ENTER THE MONSTER RACE')

// Nine-round two-player race. The shared src is the correct symbol.
for (let round = 0; round < 9; round += 1) {
  const shared = await page.locator('.race-arena').evaluate((arena) => {
    const cards = [...arena.querySelectorAll('.player-card')]
    const left = [...cards[0].querySelectorAll('img')].map((image) => image.getAttribute('src'))
    const right = [...cards[1].querySelectorAll('img')].map((image) => image.getAttribute('src'))
    return left.find((src) => right.includes(src))
  })
  await page.locator(`.player-card--${round % 2 + 1} img[src="${shared}"]`).click()
  await page.waitForTimeout(760)
}

await clickUnique('button', 'UNLOCK PARTY HALL')
await page.waitForTimeout(500)
await page.screenshot({ path: `${shots}/04-party.png` })

// Save restore and narrow-screen render.
await page.reload()
await page.waitForLoadState('domcontentloaded')
if (await page.getByText('MONSTER PARTY!', { exact: false }).count() !== 1) throw new Error('Save state was not restored')
await page.setViewportSize({ width: 390, height: 844 })
await clickUnique('button', 'EXPLORE THE HOUSE')
await page.screenshot({ path: `${shots}/05-mobile-hub.png` })

const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('monsterPartySave_v1')))
await clickUnique('button', 'Open settings')
await clickUnique('button', 'RESET GAME')
await clickUnique('button', 'YES, RESET')
await page.waitForTimeout(250)
const resetSave = await page.evaluate(() => JSON.parse(localStorage.getItem('monsterPartySave_v1')))
if (resetSave.completed.length || resetSave.raceComplete || resetSave.location !== 'start') throw new Error('Reset did not return the initial state')
if (await page.getByRole('button', { name: 'ENTER THE HOUSE', exact: true }).count() !== 1) throw new Error('Start screen did not return after reset')
console.log(JSON.stringify({ errors, saved, resetSave, screenshots: 5 }, null, 2))
await browser.close()
if (errors.length) process.exitCode = 1
