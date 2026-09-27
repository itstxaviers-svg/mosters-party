import { useCallback, useEffect, useState } from 'react'
import type { Location, MonsterId, SaveState } from '../types'

const STORAGE_KEY = 'monsterPartySave_v1'

const initialState: SaveState = {
  location: 'start',
  discovered: [],
  completed: [],
  raceComplete: false,
  soundOn: true,
  tutorialSeen: false,
  partySeen: false,
}

const readSave = (): SaveState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState
  } catch {
    return initialState
  }
}

export function useGameSave() {
  const [state, setState] = useState<SaveState>(readSave)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const go = useCallback((location: Location) => setState((current) => ({ ...current, location })), [])
  const discover = useCallback((id: MonsterId) => setState((current) => current.discovered.includes(id)
    ? current
    : { ...current, discovered: [...current.discovered, id] }), [])
  const complete = useCallback((id: MonsterId) => setState((current) => current.completed.includes(id)
    ? current
    : { ...current, completed: [...current.completed, id] }), [])
  const patch = useCallback((next: Partial<SaveState>) => setState((current) => ({ ...current, ...next })), [])
  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState(initialState)
  }, [])

  return { state, go, discover, complete, patch, reset }
}
