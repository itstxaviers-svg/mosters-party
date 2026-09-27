import type { MonsterId } from '../types'
import { assetUrl } from './gameData'

export interface Actor {
  id: MonsterId
  name: string
  feeling: string
  character: string
  portrait: string
  voice: string
  welcome: string
  feelingAudio: string
  room: string
  roomBackground: string
  video: string
}

export const originalImages = {
  title: assetUrl('assets/images/original/title.jpg'),
  house: assetUrl('assets/images/original/house.jpg'),
  deck: assetUrl('assets/images/original/deck.jpg'),
  stage: assetUrl('assets/images/original/monster-stage.jpg'),
  feelings: assetUrl('assets/images/original/feelings.jpg'),
  foodIntro: assetUrl('assets/images/original/food-intro.jpg'),
  foodRoom: assetUrl('assets/images/original/food-room.jpg'),
  race: assetUrl('assets/images/original/race.jpg'),
  party: assetUrl('assets/images/original/party.jpg'),
}

export const actors: Actor[] = [
  {
    id: 'witch', name: 'Witch', feeling: 'OK', room: 'kitchen',
    character: assetUrl('assets/images/characters/witch.webp'), portrait: assetUrl('assets/images/portraits/witch.webp'),
    voice: assetUrl('assets/audio/characters/witch.wav'), welcome: assetUrl('assets/audio/welcome/witch.wav'),
    feelingAudio: assetUrl('assets/audio/feelings/witch-ok.wav'), roomBackground: assetUrl('assets/images/original/room-witch.jpg'),
    video: assetUrl('assets/video/witch.mp4'),
  },
  {
    id: 'skeleton', name: 'Skeleton', feeling: 'GREAT', room: 'bathroom',
    character: assetUrl('assets/images/characters/skeleton.webp'), portrait: assetUrl('assets/images/portraits/skeleton.webp'),
    voice: assetUrl('assets/audio/characters/skeleton.wav'), welcome: assetUrl('assets/audio/welcome/skeleton.wav'),
    feelingAudio: assetUrl('assets/audio/feelings/skeleton-great.wav'), roomBackground: assetUrl('assets/images/original/room-skeleton.jpg'),
    video: assetUrl('assets/video/skeleton.mp4'),
  },
  {
    id: 'troll', name: 'Troll', feeling: 'HUNGRY', room: 'basement',
    character: assetUrl('assets/images/characters/troll.webp'), portrait: assetUrl('assets/images/portraits/troll.webp'),
    voice: assetUrl('assets/audio/characters/troll.wav'), welcome: assetUrl('assets/audio/welcome/troll.wav'),
    feelingAudio: assetUrl('assets/audio/feelings/troll-hungry.wav'), roomBackground: assetUrl('assets/images/original/room-troll.jpg'),
    video: assetUrl('assets/video/troll.mp4'),
  },
  {
    id: 'vampire', name: 'Vampire', feeling: 'TIRED', room: 'bedroom',
    character: assetUrl('assets/images/characters/vampire.webp'), portrait: assetUrl('assets/images/portraits/vampire.webp'),
    voice: assetUrl('assets/audio/characters/vampire.wav'), welcome: assetUrl('assets/audio/welcome/vampire.wav'),
    feelingAudio: assetUrl('assets/audio/feelings/vampire-tired.wav'), roomBackground: assetUrl('assets/images/original/room-vampire.jpg'),
    video: assetUrl('assets/video/vampire.mp4'),
  },
  {
    id: 'ghost', name: 'Ghost', feeling: 'COLD', room: 'living room',
    character: assetUrl('assets/images/characters/ghost.webp'), portrait: assetUrl('assets/images/portraits/ghost.webp'),
    voice: assetUrl('assets/audio/characters/ghost.wav'), welcome: assetUrl('assets/audio/welcome/ghost.wav'),
    feelingAudio: assetUrl('assets/audio/feelings/ghost-cold.wav'), roomBackground: assetUrl('assets/images/original/room-ghost.jpg'),
    video: assetUrl('assets/video/ghost.mp4'),
  },
  {
    id: 'raven', name: 'Raven', feeling: 'GOOD', room: 'attic',
    character: assetUrl('assets/images/characters/raven.webp'), portrait: assetUrl('assets/images/portraits/raven.webp'),
    voice: assetUrl('assets/audio/characters/raven.wav'), welcome: assetUrl('assets/audio/welcome/raven.wav'),
    feelingAudio: assetUrl('assets/audio/feelings/raven-good.wav'), roomBackground: assetUrl('assets/images/original/room-raven.jpg'),
    video: assetUrl('assets/video/raven.mp4'),
  },
]

export const actorById = Object.fromEntries(actors.map((actor) => [actor.id, actor])) as Record<MonsterId, Actor>

export const originalFoods = [
  { id: 'melon', label: 'MELON', image: assetUrl('assets/images/food/melon.webp'), audio: assetUrl('assets/audio/food/melon.wav') },
  { id: 'toast', label: 'TOAST', image: assetUrl('assets/images/food/toast.webp'), audio: assetUrl('assets/audio/food/toast.wav') },
  { id: 'bacon', label: 'BACON', image: assetUrl('assets/images/food/bacon.webp'), audio: assetUrl('assets/audio/food/bacon.wav') },
  { id: 'juice', label: 'JUICE', image: assetUrl('assets/images/food/juice.webp'), audio: assetUrl('assets/audio/food/juice.wav') },
  { id: 'peach', label: 'PEACH', image: assetUrl('assets/images/food/peach.webp'), audio: assetUrl('assets/audio/food/peach.wav') },
  { id: 'roll', label: 'ROLL', image: assetUrl('assets/images/food/roll.webp'), audio: assetUrl('assets/audio/food/roll.wav') },
] as const

export const correctAudio = assetUrl('assets/audio/ui/correct.wav')
export const wrongAudio = assetUrl('assets/audio/ui/wrong.wav')

export const sceneNames = [
  'Welcome', 'The house', 'Meet the monsters', 'Monster movie', 'Who is speaking?',
  'Monster break', 'How are you?', 'Feelings movie', '60 second challenge', 'Food words',
  'Food game', 'Quick challenge', 'Party invitations', 'Race', 'Two-player race',
  'Race movie', 'Party movie', 'Monster party',
] as const
