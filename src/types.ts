export type MonsterId = 'skeleton' | 'troll' | 'witch' | 'vampire' | 'ghost' | 'raven'

export type Location = 'start' | 'intro' | 'hub' | MonsterId | 'keyAssembly' | 'race' | 'party'

export interface Monster {
  id: MonsterId
  name: string
  room: string
  tagline: string
  color: string
  unlockAt: number
  character: string
  portrait: string
  background: string
  voice: string
  welcome: string
  video: string
  challenge: 'audio' | 'rooms' | 'food' | 'mood' | 'memory' | 'invitation'
}

export interface SaveState {
  location: Location
  discovered: MonsterId[]
  completed: MonsterId[]
  raceComplete: boolean
  soundOn: boolean
  tutorialSeen: boolean
  partySeen: boolean
}
