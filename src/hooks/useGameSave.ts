import { useCallback, useEffect, useState } from 'react'
import type { SaveState } from '../types'

const STORAGE_KEY = 'monsterPartyOriginalSave_v2'

const initialState: SaveState = {
  scene: 0,
  soundOn: true,
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

  const go = useCallback((scene: number) => setState((current) => ({ ...current, scene })), [])
  const patch = useCallback((next: Partial<SaveState>) => setState((current) => ({ ...current, ...next })), [])
  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState(initialState)
  }, [])

  return { state, go, patch, reset }
}
