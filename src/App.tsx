import { useEffect, useMemo, useState } from 'react'
import { Expand, RotateCcw, Settings, Volume2, VolumeX, X } from 'lucide-react'
import { actors, correctAudio, originalFoods, originalImages, sceneNames, wrongAudio } from './data/originalGame'
import { assetUrl } from './data/gameData'
import { useAudioManager } from './hooks/useAudioManager'
import { useGameSave } from './hooks/useGameSave'
import type { MonsterId } from './types'

const shuffle = <T,>(items: readonly T[]): T[] => [...items].sort(() => Math.random() - 0.5)

function App() {
  const { state, go, patch, reset } = useGameSave()
  const audio = useAudioManager(state.soundOn)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const scene = Math.min(state.scene, sceneNames.length - 1)
  const next = () => go(Math.min(scene + 1, sceneNames.length - 1))

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
    else document.documentElement.requestFullscreen().catch(() => undefined)
  }

  return (
    <main className="game-shell">
      <section className="game-stage" data-scene={scene}>
        {scene > 0 && scene < sceneNames.length - 1 && (
          <div className="scene-marker" aria-label={`Scene ${scene + 1} of ${sceneNames.length}`}>
            <span>{String(scene + 1).padStart(2, '0')}</span><i /><small>{sceneNames[scene]}</small>
          </div>
        )}
        <button className="settings-trigger" aria-label="Settings" onClick={() => setSettingsOpen(true)}><Settings /></button>

        {scene === 0 && <CoverScene onNext={next} />}
        {scene === 1 && <HouseScene onNext={next} />}
        {scene === 2 && <MeetScene play={audio.play} onNext={next} />}
        {scene === 3 && <VideoScene source={assetUrl('assets/video/monster-party.mp4')} title="Welcome to the Monster House" onNext={next} />}
        {scene === 4 && <VoiceDeck play={audio.play} onDone={next} />}
        {scene === 5 && <VideoScene source={assetUrl('assets/video/skeleton.mp4')} title="A message from the monsters" onNext={next} />}
        {scene === 6 && <FeelingsChallenge play={audio.play} onDone={next} />}
        {scene === 7 && <VideoScene source={assetUrl('assets/video/vampire.mp4')} title="How are the monsters?" onNext={next} />}
        {scene === 8 && <TimedChallenge seconds={60} source={assetUrl('assets/video/vampire-clue.mp4')} onNext={next} />}
        {scene === 9 && <FoodVocabulary play={audio.play} onDone={next} />}
        {scene === 10 && <FoodMemory play={audio.play} onDone={next} />}
        {scene === 11 && <TimedChallenge seconds={7} source={assetUrl('assets/video/witch.mp4')} onNext={next} />}
        {scene === 12 && <InvitationJourney play={audio.play} onDone={next} />}
        {scene === 13 && <RaceIntro onNext={next} />}
        {scene === 14 && <MonsterRace play={audio.play} onDone={next} />}
        {scene === 15 && <VideoScene source={assetUrl('assets/video/raven.mp4')} title="The race is over!" onNext={next} />}
        {scene === 16 && <VideoScene source={assetUrl('assets/video/monster-party.mp4')} title="The party is ready" onNext={next} />}
        {scene === 17 && <PartyScene onReplay={reset} />}

        {settingsOpen && (
          <SettingsPanel
            soundOn={state.soundOn}
            onSound={() => patch({ soundOn: !state.soundOn })}
            onFullscreen={toggleFullscreen}
            onRestart={() => { reset(); setSettingsOpen(false) }}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </section>
    </main>
  )
}

function NextButton({ onClick, children = 'NEXT', disabled = false }: { onClick: () => void; children?: React.ReactNode; disabled?: boolean }) {
  return <button className="next-plaque" aria-label={typeof children === 'string' ? children : undefined} onClick={onClick} disabled={disabled}><span>{children}</span><b>›</b></button>
}

function CoverScene({ onNext }: { onNext: () => void }) {
  return <div className="scene art-scene" style={{ '--scene-art': `url("${originalImages.title}")` } as React.CSSProperties}>
    <div className="paper-grain" /><NextButton onClick={onNext}>START</NextButton>
  </div>
}

function HouseScene({ onNext }: { onNext: () => void }) {
  return <div className="scene art-scene" style={{ '--scene-art': `url("${originalImages.house}")` } as React.CSSProperties}>
    <div className="mist mist-one" /><div className="mist mist-two" /><NextButton onClick={onNext} />
  </div>
}

function MeetScene({ play, onNext }: { play: (source: string) => void; onNext: () => void }) {
  return <div className="scene art-scene meet-scene" style={{ '--scene-art': `url("${originalImages.house}")` } as React.CSSProperties}>
    <div className="meet-title"><span>MEET THE</span><strong>MONSTERS</strong><small>Tap a monster to hear its voice</small></div>
    <div className="monster-cast">
      {actors.map((actor) => <button className={`cast-member cast-${actor.id}`} key={actor.id} onClick={() => play(actor.voice)} aria-label={`Listen to ${actor.name}`}>
        <img src={actor.character} alt={actor.name} /><span>{actor.name}</span>
      </button>)}
    </div>
    <NextButton onClick={onNext} />
  </div>
}

function VideoScene({ source, title, onNext }: { source: string; title: string; onNext: () => void }) {
  return <div className="scene video-scene">
    <div className="video-frame"><p>{title}</p><video src={source} controls playsInline preload="metadata" /></div>
    <NextButton onClick={onNext} />
  </div>
}

function VoiceDeck({ play, onDone }: { play: (source: string) => void; onDone: () => void }) {
  const cards = useMemo(() => shuffle([...actors, ...actors]), [])
  const [round, setRound] = useState(0)
  const [drawn, setDrawn] = useState(false)
  const [wrong, setWrong] = useState<MonsterId | null>(null)
  const target = cards[round]
  const draw = () => { setDrawn(true); play(target.voice) }
  const choose = (id: MonsterId) => {
    if (!drawn) return
    if (id !== target.id) { setWrong(id); play(wrongAudio); window.setTimeout(() => setWrong(null), 500); return }
    play(correctAudio)
    window.setTimeout(() => round === cards.length - 1 ? onDone() : (setRound((value) => value + 1), setDrawn(false)), 550)
  }
  return <div className="scene art-scene deck-scene" style={{ '--scene-art': `url("${originalImages.deck}")` } as React.CSSProperties}>
    <div className="score-ribbon"><span>SCORE</span><strong>{round}</strong><i>/</i><b>12</b></div>
    <div className="deck-copy"><span>WHO IS SPEAKING?</span><strong>{drawn ? 'LISTEN AND CHOOSE' : 'DRAW A CARD'}</strong></div>
    <button className={`magic-deck ${drawn ? 'is-drawn' : ''}`} data-target={target.id} onClick={draw} aria-label="Draw and listen to a card"><span>{drawn ? <Volume2 /> : '?'}</span><b>{drawn ? 'LISTEN AGAIN' : 'DRAW'}</b></button>
    <div className={`portrait-choices ${!drawn ? 'is-locked' : ''}`}>
      {actors.map((actor) => <button className={wrong === actor.id ? 'is-wrong' : ''} key={actor.id} onClick={() => choose(actor.id)}><img src={actor.portrait} alt={actor.name} /><span>{actor.name}</span></button>)}
    </div>
  </div>
}

function FeelingsChallenge({ play, onDone }: { play: (source: string) => void; onDone: () => void }) {
  const prompts = useMemo(() => shuffle(actors), [])
  const [round, setRound] = useState(0)
  const [wrong, setWrong] = useState<MonsterId | null>(null)
  const target = prompts[round]
  const choose = (id: MonsterId) => {
    if (id !== target.id) { setWrong(id); play(wrongAudio); window.setTimeout(() => setWrong(null), 450); return }
    play(correctAudio); window.setTimeout(() => round === prompts.length - 1 ? onDone() : setRound((value) => value + 1), 500)
  }
  return <div className="scene art-scene feelings-scene" style={{ '--scene-art': `url("${originalImages.feelings}")` } as React.CSSProperties}>
    <div className="task-board"><small>{round + 1} / 6</small><h2>HOW ARE YOU?</h2><button className="listen-button" data-target={target.id} onClick={() => play(target.feelingAudio)}><Volume2 /> LISTEN</button><p>Listen and tap the right monster.</p></div>
    <div className="feeling-cast">{actors.map((actor) => <button className={wrong === actor.id ? 'is-wrong' : ''} key={actor.id} onClick={() => choose(actor.id)}><img src={actor.character} alt={actor.name} /><span>{actor.feeling}</span></button>)}</div>
  </div>
}

function TimedChallenge({ seconds, source, onNext }: { seconds: number; source: string; onNext: () => void }) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (!running || remaining <= 0) return
    const timer = window.setTimeout(() => setRemaining((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [running, remaining])
  return <div className="scene timer-scene">
    <div className="timer-ring"><span>{remaining}</span><small>SECONDS</small></div>
    <div className="timer-card"><h2>{seconds === 7 ? 'QUICK CHALLENGE' : 'WATCH & REMEMBER'}</h2><p>{running ? 'Watch carefully. The clock is ticking!' : `You have ${seconds} seconds.`}</p><video src={source} controls playsInline preload="metadata" />{!running && <button className="gold-button" onClick={() => setRunning(true)}>START TIMER</button>}</div>
    <NextButton onClick={onNext}>{remaining === 0 ? 'FINISH' : 'NEXT'}</NextButton>
  </div>
}

function FoodVocabulary({ play, onDone }: { play: (source: string) => void; onDone: () => void }) {
  const [heard, setHeard] = useState<string[]>([])
  const listen = (id: string, source: string) => { play(source); setHeard((values) => values.includes(id) ? values : [...values, id]) }
  return <div className="scene art-scene food-scene" style={{ '--scene-art': `url("${originalImages.foodIntro}")` } as React.CSSProperties}>
    <div className="food-title"><small>THE WITCH'S KITCHEN</small><h2>WHAT'S FOR DINNER?</h2><p>Tap every picture and repeat the word.</p></div>
    <div className="food-shelf">{originalFoods.map((food) => <button className={heard.includes(food.id) ? 'is-heard' : ''} key={food.id} onClick={() => listen(food.id, food.audio)}><img src={food.image} alt={food.label} /><span>{food.label}</span><Volume2 /></button>)}</div>
    <NextButton onClick={onDone} disabled={heard.length < originalFoods.length}>{heard.length === originalFoods.length ? 'NEXT' : `${heard.length}/6`}</NextButton>
  </div>
}

type MemoryCard = { key: string; pair: string; kind: 'picture' | 'word'; image?: string; label: string }

function FoodMemory({ play, onDone }: { play: (source: string) => void; onDone: () => void }) {
  const cards = useMemo<MemoryCard[]>(() => shuffle(originalFoods.flatMap((food) => [
    { key: `${food.id}-picture`, pair: food.id, kind: 'picture' as const, image: food.image, label: food.label },
    { key: `${food.id}-word`, pair: food.id, kind: 'word' as const, label: food.label },
  ])), [])
  const [open, setOpen] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [locked, setLocked] = useState(false)
  const flip = (card: MemoryCard) => {
    if (locked || open.includes(card.key) || matched.includes(card.pair)) return
    const nextOpen = [...open, card.key]; setOpen(nextOpen)
    if (nextOpen.length < 2) return
    setLocked(true)
    const first = cards.find((item) => item.key === nextOpen[0])!
    if (first.pair === card.pair && first.kind !== card.kind) {
      play(correctAudio); window.setTimeout(() => { setMatched((values) => [...values, card.pair]); setOpen([]); setLocked(false) }, 450)
    } else { play(wrongAudio); window.setTimeout(() => { setOpen([]); setLocked(false) }, 750) }
  }
  return <div className="scene art-scene memory-scene" style={{ '--scene-art': `url("${originalImages.foodRoom}")` } as React.CSSProperties}>
    <div className="memory-heading"><h2>MEMORY GAME</h2><span>{matched.length} / 6 PAIRS</span></div>
    <div className="memory-grid">{cards.map((card) => {
      const revealed = open.includes(card.key) || matched.includes(card.pair)
      return <button key={card.key} className={`${revealed ? 'is-open' : ''} ${matched.includes(card.pair) ? 'is-matched' : ''}`} onClick={() => flip(card)}><span className="card-back">?</span><span className="card-front">{card.kind === 'picture' ? <img src={card.image} alt={card.label} /> : <b>{card.label}</b>}</span></button>
    })}</div>
    {matched.length === 6 && <NextButton onClick={onDone}>NEXT</NextButton>}
  </div>
}

function InvitationJourney({ play, onDone }: { play: (source: string) => void; onDone: () => void }) {
  const [round, setRound] = useState(0)
  const [wrong, setWrong] = useState<MonsterId | null>(null)
  const [movie, setMovie] = useState(false)
  const target = actors[round]
  const choose = (id: MonsterId) => {
    if (id !== target.id) { setWrong(id); play(wrongAudio); window.setTimeout(() => setWrong(null), 450); return }
    play(correctAudio); setMovie(true)
  }
  const advance = () => round === actors.length - 1 ? onDone() : (setRound((value) => value + 1), setMovie(false))
  return <div className="scene art-scene invitation-scene" style={{ '--scene-art': `url("${target.roomBackground}")` } as React.CSSProperties}>
    {!movie ? <><div className="invitation-copy"><small>INVITATION {round + 1} / 6</small><h2>WHO LIVES IN THE<br />{target.room.toUpperCase()}?</h2><button className="listen-button" data-target={target.id} onClick={() => play(target.welcome)}><Volume2 /> LISTEN</button></div>
      <div className="invitation-options">{actors.map((actor) => <button className={wrong === actor.id ? 'is-wrong' : ''} key={actor.id} onClick={() => choose(actor.id)}><img src={actor.portrait} alt={actor.name} /><span>{actor.name}</span></button>)}</div></> :
      <div className="room-movie"><img src={target.character} alt={target.name} /><div><small>WELCOME, {target.name.toUpperCase()}!</small><video src={target.video} controls autoPlay playsInline /><button className="gold-button" onClick={advance}>{round === 5 ? 'GO TO THE RACE' : 'NEXT INVITATION'}</button></div></div>}
  </div>
}

function RaceIntro({ onNext }: { onNext: () => void }) {
  return <div className="scene art-scene race-intro" style={{ '--scene-art': `url("${originalImages.foodRoom}")` } as React.CSSProperties}><div className="race-logo"><small>TWO PLAYERS</small><h2>RACE</h2><p>Find the matching picture first!</p></div><NextButton onClick={onNext}>NEXT</NextButton></div>
}

const raceSymbols = [...actors.map((actor) => ({ id: actor.id, label: actor.name, image: actor.portrait })), ...originalFoods.map((food) => ({ id: food.id, label: food.label, image: food.image }))]
const raceRounds = Array.from({ length: 9 }, (_, index) => {
  const shared = raceSymbols[index % raceSymbols.length]
  const others = raceSymbols.filter((symbol) => symbol.id !== shared.id)
  return { shared, left: shuffle([shared, others[(index + 1) % others.length], others[(index + 4) % others.length], others[(index + 7) % others.length]]), right: shuffle([shared, others[(index + 2) % others.length], others[(index + 5) % others.length], others[(index + 8) % others.length]]) }
})

function MonsterRace({ play, onDone }: { play: (source: string) => void; onDone: () => void }) {
  const [round, setRound] = useState(0)
  const [scores, setScores] = useState<[number, number]>([0, 0])
  const [locked, setLocked] = useState(false)
  const [finished, setFinished] = useState(false)
  const current = raceRounds[round]
  const choose = (player: 0 | 1, id: string) => {
    if (locked || finished) return
    if (id !== current.shared.id) { play(wrongAudio); return }
    setLocked(true); play(correctAudio)
    const nextScores: [number, number] = player === 0 ? [scores[0] + 1, scores[1]] : [scores[0], scores[1] + 1]
    setScores(nextScores)
    window.setTimeout(() => round === raceRounds.length - 1 ? setFinished(true) : (setRound((value) => value + 1), setLocked(false)), 500)
  }
  return <div className="scene art-scene race-scene" style={{ '--scene-art': `url("${originalImages.race}")` } as React.CSSProperties}>
    <header className="race-header"><span>ROUND {round + 1} / 9</span><h2>RACE</h2><strong>{scores[0]} : {scores[1]}</strong></header>
    {!finished ? <div className="race-table">{[0, 1].map((player) => <section key={player} className={`race-player player-${player + 1}`}><h3>PLAYER {player + 1}</h3><div>{(player === 0 ? current.left : current.right).map((symbol) => <button key={symbol.id} onClick={() => choose(player as 0 | 1, symbol.id)}><img src={symbol.image} alt={symbol.label} /></button>)}</div></section>)}<span className="race-vs">VS</span></div> :
      <div className="race-result"><small>FINISH!</small><h2>{scores[0] === scores[1] ? 'DRAW' : `PLAYER ${scores[0] > scores[1] ? 1 : 2} WINS`}</h2><p>{scores[0]} — {scores[1]}</p><NextButton onClick={onDone}>NEXT</NextButton></div>}
  </div>
}

function PartyScene({ onReplay }: { onReplay: () => void }) {
  return <div className="scene art-scene party-scene" style={{ '--scene-art': `url("${originalImages.party}")` } as React.CSSProperties}><div className="confetti">{Array.from({ length: 30 }).map((_, index) => <i key={index} style={{ '--i': index } as React.CSSProperties} />)}</div><div className="party-message"><small>YOU DID IT!</small><h2>WELCOME TO THE<br />MONSTERS' PARTY!</h2><button className="gold-button" onClick={onReplay}><RotateCcw /> PLAY AGAIN</button></div></div>
}

function SettingsPanel({ soundOn, onSound, onFullscreen, onRestart, onClose }: { soundOn: boolean; onSound: () => void; onFullscreen: () => void; onRestart: () => void; onClose: () => void }) {
  return <div className="modal-backdrop"><section className="settings-card" role="dialog" aria-modal="true" aria-label="Settings"><button className="modal-close" aria-label="Close settings" onClick={onClose}><X /></button><small>MONSTERS' PARTY</small><h2>SETTINGS</h2><button onClick={onSound}>{soundOn ? <Volume2 /> : <VolumeX />} SOUND {soundOn ? 'ON' : 'OFF'}</button><button onClick={onFullscreen}><Expand /> FULLSCREEN</button><button onClick={onRestart}><RotateCcw /> START AGAIN</button></section></div>
}

export default App
