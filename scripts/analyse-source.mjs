import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const monstersRoot = path.join(root, '_source/monsters/monsters')
const geniallyRoot = path.join(root, '_source/genially')
const docsRoot = path.join(root, 'docs')
await mkdir(docsRoot, { recursive: true })

const walk = async (directory) => {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...await walk(absolute))
    else result.push(absolute)
  }
  return result
}

const files = await walk(monstersRoot)
const relative = (file) => path.relative(monstersRoot, file)
const extension = (file) => path.extname(file).slice(1).toLowerCase()
const counts = Object.fromEntries([...new Set(files.map(extension))].sort().map((ext) => [ext, files.filter((file) => extension(file) === ext).length]))

const hashGroups = new Map()
for (const file of files) {
  const hash = createHash('sha256').update(await readFile(file)).digest('hex')
  hashGroups.set(hash, [...(hashGroups.get(hash) || []), relative(file)])
}
const duplicateGroups = [...hashGroups.values()].filter((group) => group.length > 1)

const monsters = ['skeleton', 'troll', 'witch', 'vampire', 'ghost', 'raven']
const inferMonster = (source) => {
  const lower = source.toLowerCase()
  const aliases = { skeleton: ['skeleton', '/sk ', '/sk.', '/sk_'], troll: ['troll', '/tr ', '/tr.'], witch: ['witch', '/wi ', '/wi.'], vampire: ['vampire', '/vam ', '/v '], ghost: ['ghost', '/gh ', '/gh.'], raven: ['raven', '/rav ', '/r '] }
  return monsters.find((monster) => aliases[monster].some((alias) => lower.includes(alias))) || null
}
const inferUse = (source) => {
  const lower = source.toLowerCase()
  if (lower.includes('food')) return ['WitchKitchen', 'MemoryGame', 'MonsterRace']
  if (lower.includes('invitation game')) return ['InvitationChallenge']
  if (lower.includes('audio characters')) return ['AudioChoiceChallenge']
  if (lower.includes('rooms picx')) return ['RoomSoundChallenge']
  if (lower.includes('video house')) return ['MagicMirror']
  if (lower.includes('cafe game/final')) return ['FinalParty']
  if (lower.includes('gif/')) return ['MonsterRoom', 'MonsterBook']
  return []
}

const raster = new Set(['png', 'jpg', 'jpeg', 'gif'])
const assets = []
for (const file of files) {
  const source = relative(file)
  const corrected = raster.has(extension(file)) ? path.join('archive/corrected', source) : null
  assets.push({
    source: path.join('_source/monsters/monsters', source),
    type: extension(file),
    corrected: corrected && existsSync(path.join(root, corrected)) ? corrected : null,
    usedBy: inferUse(source),
    monster: inferMonster(source),
    scene: null,
    bytes: (await stat(file)).size,
  })
}
await writeFile(path.join(root, 'asset-manifest.json'), JSON.stringify({ source: 'monsters.zip', counts, duplicateGroups, assets }, null, 2))

const html = await readFile(path.join(geniallyRoot, 'genially.html'), 'utf8')
const encoded = html.match(/window\.dataBase64="([^"]+)"/)?.[1]
if (!encoded) throw new Error('Genially dataBase64 payload not found')
const data = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'))
const slides = [...data.Slides].sort((a, b) => a.Order - b.Order)
const slideIndex = new Map(slides.map((slide, index) => [slide.Id, index]))
const elementArrays = ['Images', 'Texts', 'Groups', 'Svgs', 'Videos', 'RichContents', 'Areas', 'ContainerBoxes', 'Pins']
const elements = elementArrays.flatMap((key) => data[key] || [])
const edges = new Map(slides.map((slide) => [slide.Id, new Set()]))

const collectAction = (action, from) => {
  if (!action) return
  if (action.type === 'goToSlide') {
    let target = action.target?.slideId || action.slideId || action.page?.slideId
    const smartLink = action.target?.smartLink || action.smartLink || action.page?.smartLink
    if (smartLink === 'nextPage') target = slides[slideIndex.get(from) + 1]?.Id
    if (target) edges.get(from).add(target)
  }
  for (const child of action.interactivityActions || []) collectAction(child, from)
}
for (const element of elements) {
  for (const actionId of Object.values(element.interactivities || {})) collectAction(data.interactivityActions[actionId], element.IdSlide)
}
const reachable = new Set([slides[0].Id])
const queue = [slides[0].Id]
while (queue.length) {
  const current = queue.shift()
  for (const target of edges.get(current)) if (!reachable.has(target)) { reachable.add(target); queue.push(target) }
}

const types = [
  'Title / entry', 'House introduction', 'Meet the six monsters', 'Intro video', 'Random character deck', 'Random deck completion state',
  'Skeleton audio choice', 'Troll audio choice', 'Witch audio choice', 'Vampire audio choice', 'Ghost audio choice', 'Raven audio choice',
  'Skeleton duplicate challenge', 'Troll duplicate challenge', 'Witch duplicate challenge', 'Vampire duplicate challenge', 'Ghost duplicate challenge', 'Raven duplicate challenge',
  'Monster video', 'How are you? choice challenge', 'Video transition', 'Timed video challenge (60s)', 'Transition / instruction', 'Illustrated activity',
  'Food vocabulary + 12-card memory', 'Timed video challenge (7s)', 'Video scene', 'Illustrated response', 'Video scene', 'Illustrated response',
  'Video scene', 'Illustrated response', 'Video scene', 'Illustrated response', 'Video scene', 'Illustrated response', 'Video scene', 'Illustrated response',
  'Race introduction', 'Two-player race (9 rounds)', 'Race video', 'Final video', 'Final party',
]
const destinations = [
  'Welcome', 'Haunted house', 'Meet the monsters', 'Intro video', 'Voice deck', 'Voice deck',
  'Voice deck response', 'Voice deck response', 'Voice deck response', 'Voice deck response', 'Voice deck response', 'Voice deck response',
  'Archive only', 'Archive only', 'Archive only', 'Archive only', 'Archive only', 'Archive only',
  'Monster video', 'Feelings challenge', 'Feelings video', '60-second challenge', 'Food introduction', 'Food activity',
  'Food vocabulary + Memory', '7-second challenge', 'Invitation journey', 'Invitation response', 'Invitation journey', 'Invitation response',
  'Invitation journey', 'Invitation response', 'Invitation journey', 'Invitation response', 'Invitation journey', 'Invitation response',
  'Invitation journey', 'Invitation response', 'Race introduction', 'Two-player Race', 'Race video', 'Party video', 'Final party',
]

const cleanText = (value) => value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
let flow = '# Original Genially flow\n\n'
flow += 'Generated from the embedded Genially JSON. The export is reference-only; no Genially runtime is used by the React app. Reachability begins at Scene 01 and follows every native `goToSlide` action.\n\n'
for (const [index, slide] of slides.entries()) {
  const images = (data.Images || []).filter((item) => item.IdSlide === slide.Id).map((item) => item.Source)
  const videos = (data.Videos || []).filter((item) => item.IdSlide === slide.Id).map((item) => item.Source)
  const texts = (data.Texts || []).filter((item) => item.IdSlide === slide.Id).map((item) => cleanText(item.TextMessage)).filter(Boolean)
  const actionIds = elements.filter((item) => item.IdSlide === slide.Id).flatMap((item) => Object.values(item.interactivities || {}))
  const audio = []
  const scanAudio = (action) => {
    if (!action) return
    if (action.type === 'playAudio') audio.push(`${action.name} — ${action.source}`)
    for (const child of action.interactivityActions || []) scanAudio(child)
  }
  actionIds.forEach((id) => scanAudio(data.interactivityActions[id]))
  const next = [...edges.get(slide.Id)].map((id) => String(slides[slideIndex.get(id)].Order).padStart(2, '0'))
  flow += `## Scene ${String(index + 1).padStart(2, '0')} — ${types[index]}\n\n`
  flow += `- Original slide: order ${slide.Order}, name \`${slide.Name}\`, id \`${slide.Id}\`\n`
  flow += `- Status: **${reachable.has(slide.Id) ? 'REACHABLE' : 'ORPHAN / UNREACHABLE IN ORIGINAL'}**\n`
  flow += `- Background: \`${slide.Background || 'none'}\`\n`
  flow += `- Images: ${images.length ? images.map((item) => `\`${item}\``).join(', ') : 'none'}\n`
  flow += `- Audio: ${audio.length ? [...new Set(audio)].map((item) => `\`${item}\``).join(', ') : 'none'}\n`
  flow += `- Video: ${videos.length ? videos.map((item) => `\`${item}\``).join(', ') : 'none'}\n`
  flow += `- Visible text/state: ${texts.length ? [...new Set(texts)].join(' · ') : 'image/video-led scene'}\n`
  flow += `- Interactions: ${actionIds.length} linked action(s); correct/wrong audio and staged feedback are preserved where present.\n`
  flow += `- Original next: ${next.length ? next.map((item) => `Scene ${item}`).join(', ') : 'end'}\n`
  flow += `- Rebuild stage: **${destinations[index]}**\n\n`
}
await writeFile(path.join(docsRoot, 'original-flow.md'), `${flow.trimEnd()}\n`)

const localVideos = files.filter((file) => extension(file) === 'mp4').map(relative).sort()
const externalVideos = data.Videos.map((video) => video.Source)
const correctedReport = JSON.parse(await readFile(path.join(docsRoot, 'all-assets-color-correction.json'), 'utf8'))
const failedCorrections = correctedReport.filter((entry) => entry.error)
const report = `# Asset report\n\n` +
`## monsters.zip\n\n` +
`- Files: **${files.length}**\n` +
`- PNG: **${counts.png || 0}**\n` +
`- JPG/JPEG: **${(counts.jpg || 0) + (counts.jpeg || 0)}**\n` +
`- GIF: **${counts.gif || 0}**\n` +
`- WAV: **${counts.wav || 0}**\n` +
`- MP3: **${counts.mp3 || 0}**\n` +
`- Local MP4: **${counts.mp4 || 0}**\n` +
`- Exact duplicate groups retained: **${duplicateGroups.length}**\n\n` +
`## Colour correction\n\n` +
`The per-image Pillow pipeline processed **${correctedReport.length}** raster files (including every frame of ${counts.gif || 0} GIFs). Failed: **${failedCorrections.length}**. Originals remain in \`_source/monsters\`; corrected archive copies are in \`archive/corrected\`; curated runtime copies are in \`public/assets/images\`.\n\n` +
`## Video sources\n\n` +
`All production video is local. The original Genially contains ${externalVideos.length} Vimeo references, preserved below for audit only and not used at runtime.\n\n` +
`### Local video files (${localVideos.length})\n\n${localVideos.map((item) => `- \`${item}\``).join('\n')}\n\n` +
`### Original external references (${externalVideos.length})\n\n${externalVideos.map((item) => `- ${item}`).join('\n')}\n\n` +
`## Restored gameplay\n\n- Original linear scene order\n- Twelve-card character voice deck\n- Six original “How are you?” prompts\n- Food vocabulary: toast, juice, melon, roll, bacon, peach\n- Six-pair Memory game\n- Six-room invitation/welcome journey\n- Local character and transition videos\n- Nine-round, two-player Monster Race\n- Final Monsters' Party scene and replay\n`
await writeFile(path.join(docsRoot, 'asset-report.md'), report)

console.log(JSON.stringify({ counts, files: files.length, corrected: correctedReport.length, correctionFailures: failedCorrections.length, slides: slides.length, orphanSlides: slides.filter((slide) => !reachable.has(slide.Id)).map((slide) => slide.Order), localVideos: localVideos.length, externalVideos: externalVideos.length }, null, 2))
