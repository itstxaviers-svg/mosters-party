import { useCallback, useEffect, useRef } from 'react'

export function useAudioManager(enabled: boolean) {
  const active = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    if (!active.current) return
    active.current.pause()
    active.current.currentTime = 0
    active.current = null
  }, [])

  const play = useCallback((source: string) => {
    if (!enabled) return
    stop()
    const audio = new Audio(source)
    active.current = audio
    audio.play().catch(() => undefined)
    audio.addEventListener('ended', () => {
      if (active.current === audio) active.current = null
    }, { once: true })
  }, [enabled, stop])

  useEffect(() => () => stop(), [stop])
  useEffect(() => { if (!enabled) stop() }, [enabled, stop])

  return { play, stop }
}
