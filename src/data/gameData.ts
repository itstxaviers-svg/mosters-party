import type { Monster, MonsterId } from '../types'

export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

export const monsters: Monster[] = [
  {
    id: 'skeleton', name: 'Skeleton', room: 'Echo Bathroom', tagline: 'Listen closely. Who is speaking?',
    color: '#b7f27d', unlockAt: 0,
    character: assetUrl('assets/images/characters/skeleton.webp'), portrait: assetUrl('assets/images/portraits/skeleton.webp'),
    background: assetUrl('assets/images/rooms/skeleton.webp'), voice: assetUrl('assets/audio/characters/skeleton.wav'),
    welcome: assetUrl('assets/audio/welcome/skeleton.wav'), video: assetUrl('assets/video/skeleton.mp4'), challenge: 'audio',
  },
  {
    id: 'troll', name: 'Troll', room: 'Basement Workshop', tagline: 'The house has six rooms. Find each sound.',
    color: '#f6b73c', unlockAt: 0,
    character: assetUrl('assets/images/characters/troll.webp'), portrait: assetUrl('assets/images/portraits/troll.webp'),
    background: assetUrl('assets/images/rooms/troll.webp'), voice: assetUrl('assets/audio/characters/troll.wav'),
    welcome: assetUrl('assets/audio/welcome/troll.wav'), video: assetUrl('assets/video/troll.mp4'), challenge: 'rooms',
  },
  {
    id: 'witch', name: 'Witch', room: 'Witch Kitchen', tagline: 'Fill the tray with the food you hear.',
    color: '#ca8cff', unlockAt: 0,
    character: assetUrl('assets/images/characters/witch.webp'), portrait: assetUrl('assets/images/portraits/witch.webp'),
    background: assetUrl('assets/images/rooms/witch.webp'), voice: assetUrl('assets/audio/characters/witch.wav'),
    welcome: assetUrl('assets/audio/welcome/witch.wav'), video: assetUrl('assets/video/witch.mp4'), challenge: 'food',
  },
  {
    id: 'vampire', name: 'Vampire', room: 'Moonlit Bedroom', tagline: 'How are you? Choose the right feeling.',
    color: '#ff6f91', unlockAt: 2,
    character: assetUrl('assets/images/characters/vampire.webp'), portrait: assetUrl('assets/images/portraits/vampire.webp'),
    background: assetUrl('assets/images/rooms/vampire.webp'), voice: assetUrl('assets/audio/characters/vampire.wav'),
    welcome: assetUrl('assets/audio/welcome/vampire.wav'), video: assetUrl('assets/video/vampire.mp4'), challenge: 'mood',
  },
  {
    id: 'ghost', name: 'Ghost', room: 'Memory Parlour', tagline: 'Match every picture to its word.',
    color: '#7fe9ff', unlockAt: 2,
    character: assetUrl('assets/images/characters/ghost.webp'), portrait: assetUrl('assets/images/portraits/ghost.webp'),
    background: assetUrl('assets/images/rooms/ghost.webp'), voice: assetUrl('assets/audio/characters/ghost.wav'),
    welcome: assetUrl('assets/audio/welcome/ghost.wav'), video: assetUrl('assets/video/ghost.mp4'), challenge: 'memory',
  },
  {
    id: 'raven', name: 'Raven', room: 'Raven Tower', tagline: 'Deliver the invitations to the right monsters.',
    color: '#6fa8ff', unlockAt: 4,
    character: assetUrl('assets/images/characters/raven.webp'), portrait: assetUrl('assets/images/portraits/raven.webp'),
    background: assetUrl('assets/images/rooms/raven.webp'), voice: assetUrl('assets/audio/characters/raven.wav'),
    welcome: assetUrl('assets/audio/welcome/raven.wav'), video: assetUrl('assets/video/raven.mp4'), challenge: 'invitation',
  },
]

export const monsterById = Object.fromEntries(monsters.map((monster) => [monster.id, monster])) as Record<MonsterId, Monster>

export const foods = [
  { id: 'melon', label: 'melon', image: assetUrl('assets/images/food/melon.webp'), audio: assetUrl('assets/audio/food/melon.wav') },
  { id: 'toast', label: 'toast', image: assetUrl('assets/images/food/toast.webp'), audio: assetUrl('assets/audio/food/toast.wav') },
  { id: 'bacon', label: 'bacon', image: assetUrl('assets/images/food/bacon.webp'), audio: assetUrl('assets/audio/food/bacon.wav') },
  { id: 'juice', label: 'juice', image: assetUrl('assets/images/food/juice.webp'), audio: assetUrl('assets/audio/food/juice.wav') },
  { id: 'peach', label: 'peach', image: assetUrl('assets/images/food/peach.webp'), audio: assetUrl('assets/audio/food/peach.wav') },
  { id: 'roll', label: 'roll', image: assetUrl('assets/images/food/roll.webp'), audio: assetUrl('assets/audio/food/roll.wav') },
] as const

export const roomWords = [
  { id: 'attic', label: 'attic', audio: assetUrl('assets/audio/rooms/attic.wav') },
  { id: 'basement', label: 'basement', audio: assetUrl('assets/audio/rooms/basement.wav') },
  { id: 'bathroom', label: 'bathroom', audio: assetUrl('assets/audio/rooms/bathroom.wav') },
  { id: 'bedroom', label: 'bedroom', audio: assetUrl('assets/audio/rooms/bedroom.wav') },
  { id: 'kitchen', label: 'kitchen', audio: assetUrl('assets/audio/rooms/kitchen.wav') },
  { id: 'living-room', label: 'living room', audio: assetUrl('assets/audio/rooms/living-room.wav') },
] as const

export const raceSymbols = [
  { id: 'skeleton', label: 'Skeleton', image: assetUrl('assets/images/portraits/skeleton.webp') },
  { id: 'troll', label: 'Troll', image: assetUrl('assets/images/portraits/troll.webp') },
  { id: 'witch', label: 'Witch', image: assetUrl('assets/images/portraits/witch.webp') },
  { id: 'vampire', label: 'Vampire', image: assetUrl('assets/images/portraits/vampire.webp') },
  { id: 'ghost', label: 'Ghost', image: assetUrl('assets/images/portraits/ghost.webp') },
  { id: 'raven', label: 'Raven', image: assetUrl('assets/images/portraits/raven.webp') },
  ...foods.map((food) => ({ id: food.id, label: food.label, image: food.image })),
]

export const wrongAudio = assetUrl('assets/audio/ui/wrong.wav')
export const correctAudio = assetUrl('assets/audio/ui/correct.wav')
