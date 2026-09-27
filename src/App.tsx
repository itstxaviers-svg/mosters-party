import { useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, DoorOpen, Expand, House, KeyRound, RotateCcw, Settings, Volume2, VolumeX, X } from 'lucide-react'
import { assetUrl, correctAudio, foods, monsterById, monsters, raceSymbols, roomWords, wrongAudio } from './data/gameData'
import { useAudioManager } from './hooks/useAudioManager'
import { useGameSave } from './hooks/useGameSave'
import type { Location, Monster, MonsterId } from './types'

const shuffle = <T,>(items: readonly T[]): T[] => [...items].sort(() => Math.random() - 0.5)

function MonsterKey({ pieces, compact = false }: { pieces: number; compact?: boolean }) {
  return (
    <div className={`monster-key ${compact ? 'monster-key--compact' : ''}`} aria-label={`${pieces} of 6 key pieces`}>
      <svg viewBox="0 0 180 108" role="img">
        <g className="key-head" transform="translate(50 54)">
          {Array.from({ length: 6 }).map((_, index) => {
            const start = (index * 60 - 90) * Math.PI / 180
            const end = ((index + 1) * 60 - 90) * Math.PI / 180
            const p1 = `${Math.cos(start) * 34},${Math.sin(start) * 34}`
            const p2 = `${Math.cos(end) * 34},${Math.sin(end) * 34}`
            return <path key={index} className={index < pieces ? 'key-piece is-found' : 'key-piece'} d={`M 0 0 L ${p1} A 34 34 0 0 1 ${p2} Z`} />
          })}
          <circle cx="0" cy="0" r="13" className="key-hole" />
        </g>
        <path className={pieces === 6 ? 'key-shaft is-found' : 'key-shaft'} d="M78 48h72v15h-12v17h-14V63h-14v12H96V63H78z" />
      </svg>
      {!compact && <span>MONSTER KEY · {pieces} / 6</span>}
    </div>
  )
}

function App() {
  const { state, go, discover, complete, patch, reset } = useGameSave()
  const audio = useAudioManager(state.soundOn)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const enterRoom = (monster: Monster) => {
    if (state.completed.length < monster.unlockAt) return
    discover(monster.id)
    go(monster.id)
    audio.play(monster.welcome)
  }

  const finishMonster = (id: MonsterId) => {
    const isNew = !state.completed.includes(id)
    if (isNew) {
      complete(id)
      audio.play(correctAudio)
      if (state.completed.length === 5) window.setTimeout(() => go('keyAssembly'), 1300)
    }
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
    else document.documentElement.requestFullscreen().catch(() => undefined)
  }

  const showHud = !['start', 'intro'].includes(state.location)

  return (
    <main className="game-shell">
      <section className="game-stage" data-location={state.location}>
        {showHud && (
          <header className="hud">
            <button className="icon-button" aria-label="Return to the Monster House" onClick={() => go('hub')}><House /></button>
            <button className="hud-key" aria-label="Monster Key progress" onClick={() => setBookOpen(true)}>
              <KeyRound /><strong>{state.completed.length}/6</strong>
            </button>
            <div className="hud-spacer" />
            <button className="icon-button" aria-label="Open Monster Book" onClick={() => setBookOpen(true)}><BookOpen /></button>
            <button className="icon-button" aria-label="Open settings" onClick={() => setSettingsOpen(true)}><Settings /></button>
          </header>
        )}

        {state.location === 'start' && <StartScreen hasSave={state.completed.length > 0} onEnter={() => go('intro')} onSettings={() => setSettingsOpen(true)} />}
        {state.location === 'intro' && <IntroScreen onDone={() => { patch({ tutorialSeen: true }); go('hub') }} />}
        {state.location === 'hub' && <Hub state={state} onEnter={enterRoom} onParty={() => {
          if (state.raceComplete) go('party')
          else if (state.completed.length === 6) go('keyAssembly')
        }} />}
        {monsters.some((monster) => monster.id === state.location) && (
          <MonsterRoom
            monster={monsterById[state.location as MonsterId]}
            alreadyComplete={state.completed.includes(state.location as MonsterId)}
            play={audio.play}
            onWrong={() => audio.play(wrongAudio)}
            onComplete={() => finishMonster(state.location as MonsterId)}
            onLeave={() => go('hub')}
          />
        )}
        {state.location === 'keyAssembly' && <KeyAssembly pieces={state.completed.length} onContinue={() => go(state.completed.length === 6 ? 'race' : 'hub')} />}
        {state.location === 'race' && <MonsterRace play={audio.play} onComplete={() => { patch({ raceComplete: true }); audio.play(correctAudio) }} onParty={() => go('party')} />}
        {state.location === 'party' && <PartyHall onExplore={() => go('hub')} onReplay={() => setResetOpen(true)} onSeen={() => patch({ partySeen: true })} />}

        {bookOpen && <MonsterBook discovered={state.discovered} completed={state.completed} onClose={() => setBookOpen(false)} />}
        {settingsOpen && (
          <SettingsPanel
            soundOn={state.soundOn}
            onSound={() => patch({ soundOn: !state.soundOn })}
            onFullscreen={toggleFullscreen}
            onReset={() => { setSettingsOpen(false); setResetOpen(true) }}
            onClose={() => setSettingsOpen(false)}
          />
        )}
        {resetOpen && <ConfirmReset onCancel={() => setResetOpen(false)} onConfirm={() => { reset(); setResetOpen(false) }} />}
      </section>
    </main>
  )
}

function StartScreen({ hasSave, onEnter, onSettings }: { hasSave: boolean; onEnter: () => void; onSettings: () => void }) {
  return (
    <div className="screen start-screen">
      <div className="fog fog--one" /><div className="fog fog--two" />
      <div className="start-copy">
        <p className="eyebrow">A MONSTER HOUSE ADVENTURE</p>
        <h1>MONSTERS'<br /><span>PARTY</span></h1>
        <p className="start-lead">Six monsters. Six challenges. One broken key.</p>
        <button className="primary-button primary-button--large" onClick={onEnter}>
          <DoorOpen /> {hasSave ? 'CONTINUE ADVENTURE' : 'ENTER THE HOUSE'}
        </button>
      </div>
      <button className="start-settings icon-button" aria-label="Settings" onClick={onSettings}><Settings /></button>
    </div>
  )
}

function IntroScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 2600)
    return () => window.clearTimeout(timer)
  }, [onDone])
  return (
    <div className="screen intro-screen" onClick={onDone}>
      <div className="intro-door"><span className="door-light" /></div>
      <div className="intro-message">
        <KeyRound />
        <h2>The Monster Key is broken!</h2>
        <p>Find all six pieces and unlock the Party Hall.</p>
      </div>
      <button className="skip-button" onClick={onDone}>Skip</button>
    </div>
  )
}

function Hub({ state, onEnter, onParty }: { state: ReturnType<typeof useGameSave>['state']; onEnter: (monster: Monster) => void; onParty: () => void }) {
  const pieces = state.completed.length
  return (
    <div className="screen hub-screen">
      <div className="hub-atmosphere" />
      <div className="objective-card">
        <span className="objective-label">YOUR QUEST</span>
        <strong>{pieces < 6 ? 'Find the six pieces of the Monster Key' : state.raceComplete ? 'The Party Hall is open!' : 'Activate the key in the Monster Race'}</strong>
      </div>
      <button className={`party-door ${state.raceComplete ? 'is-open' : ''}`} onClick={onParty} aria-label={state.raceComplete ? 'Enter the Party Hall' : 'Locked Party Hall'}>
        <span className="door-crown">PARTY HALL</span>
        <span className="lock-seal">{state.raceComplete ? <DoorOpen /> : <KeyRound />}</span>
        <span className="door-status">{state.raceComplete ? 'ENTER' : pieces === 6 ? 'FINAL SEAL' : `${pieces}/6 PIECES`}</span>
      </button>
      <div className="room-map" aria-label="Monster rooms">
        {monsters.map((monster) => {
          const locked = pieces < monster.unlockAt
          const completed = state.completed.includes(monster.id)
          return (
            <button
              key={monster.id}
              className={`room-door room-door--${monster.id} ${locked ? 'is-locked' : ''} ${completed ? 'is-complete' : ''}`}
              onClick={() => onEnter(monster)}
              aria-label={locked ? `${monster.room} is locked` : `Enter ${monster.room}`}
            >
              <span className="room-glow" style={{ '--monster-color': monster.color } as React.CSSProperties} />
              {locked ? <KeyRound className="room-lock" /> : <img src={monster.portrait} alt="" />}
              <strong>{locked ? 'LOCKED' : monster.room}</strong>
              <small>{locked ? `Find ${monster.unlockAt} pieces` : completed ? 'Piece collected · Replay' : monster.name}</small>
            </button>
          )
        })}
      </div>
      <MonsterKey pieces={pieces} />
    </div>
  )
}

function MonsterRoom({ monster, alreadyComplete, play, onWrong, onComplete, onLeave }: {
  monster: Monster
  alreadyComplete: boolean
  play: (source: string) => void
  onWrong: () => void
  onComplete: () => void
  onLeave: () => void
}) {
  const [done, setDone] = useState(false)
  const [replayKey, setReplayKey] = useState(0)
  const finish = () => { setDone(true); onComplete() }
  const challenge = (() => {
    switch (monster.challenge) {
      case 'audio': return <MonsterAudioChallenge key={replayKey} play={play} onWrong={onWrong} onDone={finish} />
      case 'rooms': return <RoomSoundChallenge key={replayKey} play={play} onWrong={onWrong} onDone={finish} />
      case 'food': return <FoodChallenge key={replayKey} play={play} onWrong={onWrong} onDone={finish} />
      case 'mood': return <MoodChallenge key={replayKey} play={play} onWrong={onWrong} onDone={finish} />
      case 'memory': return <MemoryGame key={replayKey} play={play} onDone={finish} />
      case 'invitation': return <InvitationChallenge key={replayKey} play={play} onWrong={onWrong} onDone={finish} />
    }
  })()

  return (
    <div className="screen room-screen" style={{ '--room-background': `url("${monster.background}")`, '--monster-color': monster.color } as React.CSSProperties}>
      <div className="room-vignette" />
      <button className="room-back" onClick={onLeave}><House /> HOUSE</button>
      <section className="monster-stage">
        <img className="monster-character" src={monster.character} alt={monster.name} />
        <div className="speech-bubble">
          <span>{monster.room}</span>
          <h2>{monster.name}</h2>
          <p>{monster.tagline}</p>
          <button className="audio-button" onClick={() => play(monster.voice)}><Volume2 /> Hear me</button>
        </div>
      </section>
      <section className="challenge-panel">
        {done || (alreadyComplete && replayKey === 0) ? (
          <div className="piece-earned">
            <div className="piece-burst"><KeyRound /></div>
            <p>{alreadyComplete && !done ? 'ROOM COMPLETE' : 'KEY PIECE FOUND!'}</p>
            <h3>{monster.name}'s piece is yours.</h3>
            <div className="completion-actions">
              <button className="secondary-button" onClick={() => { setDone(false); setReplayKey((value) => value + 1) }}><RotateCcw /> Replay</button>
              <button className="primary-button" onClick={onLeave}><House /> Back to house</button>
            </div>
          </div>
        ) : challenge}
      </section>
      <details className="magic-screen">
        <summary>MAGIC MIRROR · WATCH</summary>
        <video src={monster.video} controls playsInline preload="metadata" />
      </details>
    </div>
  )
}

function ChallengeHeader({ current, total, title, onListen }: { current: number; total: number; title: string; onListen?: () => void }) {
  return (
    <div className="challenge-header">
      <div><span>CHALLENGE {Math.min(current + 1, total)} / {total}</span><h3>{title}</h3></div>
      {onListen && <button className="listen-button" onClick={onListen}><Volume2 /> PLAY SOUND</button>}
    </div>
  )
}

function MonsterAudioChallenge({ play, onWrong, onDone }: ChallengeProps) {
  const targets = useMemo(() => shuffle(monsters).slice(0, 4), [])
  const [round, setRound] = useState(0)
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'right'>('idle')
  const target = targets[round]
  const choose = (id: MonsterId) => {
    if (id !== target.id) { setFeedback('wrong'); onWrong(); window.setTimeout(() => setFeedback('idle'), 450); return }
    setFeedback('right'); play(correctAudio)
    window.setTimeout(() => round + 1 === targets.length ? onDone() : (setRound(round + 1), setFeedback('idle')), 600)
  }
  return <div className={feedback === 'wrong' ? 'challenge is-wrong' : 'challenge'}>
    <ChallengeHeader current={round} total={targets.length} title="Who is speaking?" onListen={() => play(target.voice)} />
    <div className="portrait-options">{monsters.map((monster) => <button key={monster.id} onClick={() => choose(monster.id)}><img src={monster.portrait} alt="" /><span>{monster.name}</span></button>)}</div>
  </div>
}

function RoomSoundChallenge({ play, onWrong, onDone }: ChallengeProps) {
  const prompts = useMemo(() => shuffle(roomWords), [])
  const [round, setRound] = useState(0)
  const [wrong, setWrong] = useState(false)
  const prompt = prompts[round]
  const choose = (id: string) => {
    if (id !== prompt.id) { setWrong(true); onWrong(); window.setTimeout(() => setWrong(false), 420); return }
    play(correctAudio)
    window.setTimeout(() => round + 1 === prompts.length ? onDone() : setRound(round + 1), 420)
  }
  return <div className={wrong ? 'challenge is-wrong' : 'challenge'}>
    <ChallengeHeader current={round} total={prompts.length} title="Which room did you hear?" onListen={() => play(prompt.audio)} />
    <div className="word-options">{roomWords.map((room) => <button key={room.id} onClick={() => choose(room.id)}>{room.label}</button>)}</div>
  </div>
}

function FoodChallenge({ play, onWrong, onDone }: ChallengeProps) {
  const prompts = useMemo(() => shuffle(foods), [])
  const [round, setRound] = useState(0)
  const [collected, setCollected] = useState<string[]>([])
  const [wrong, setWrong] = useState(false)
  const prompt = prompts[round]
  const choose = (id: string) => {
    if (id !== prompt.id) { setWrong(true); onWrong(); window.setTimeout(() => setWrong(false), 420); return }
    const next = [...collected, id]
    setCollected(next); play(correctAudio)
    window.setTimeout(() => round + 1 === prompts.length ? onDone() : setRound(round + 1), 440)
  }
  return <div className={wrong ? 'challenge is-wrong' : 'challenge'}>
    <ChallengeHeader current={round} total={prompts.length} title="Put this food on the tray" onListen={() => play(prompt.audio)} />
    <div className="food-options">{foods.map((food) => <button className={collected.includes(food.id) ? 'is-collected' : ''} key={food.id} onClick={() => choose(food.id)} disabled={collected.includes(food.id)}><img src={food.image} alt="" /><span>{food.label}</span></button>)}</div>
  </div>
}

function MoodChallenge({ play, onWrong, onDone }: ChallengeProps) {
  const [watched, setWatched] = useState(false)
  const [wrong, setWrong] = useState(false)
  if (!watched) return <div className="challenge video-challenge">
    <ChallengeHeader current={0} total={1} title="Watch the vampire's clue" />
    <video src={assetUrl('assets/video/vampire-clue.mp4')} controls autoPlay playsInline onEnded={() => setWatched(true)} />
    <button className="text-button" onClick={() => setWatched(true)}>I watched the clue</button>
  </div>
  const choose = (answer: string) => {
    if (answer !== 'tired') { setWrong(true); onWrong(); window.setTimeout(() => setWrong(false), 450); return }
    play(correctAudio); window.setTimeout(onDone, 500)
  }
  return <div className={wrong ? 'challenge is-wrong' : 'challenge'}>
    <ChallengeHeader current={0} total={1} title="How is the vampire?" onListen={() => play(assetUrl('assets/audio/reactions/vampire-tired.wav'))} />
    <div className="mood-options"><button onClick={() => choose('great')}>GREAT</button><button onClick={() => choose('hungry')}>HUNGRY</button><button onClick={() => choose('tired')}>TIRED</button></div>
  </div>
}

function MemoryGame({ play, onDone }: Omit<ChallengeProps, 'onWrong'>) {
  const cards = useMemo(() => shuffle(foods.flatMap((food) => [
    { uid: `${food.id}-image`, pair: food.id, kind: 'image' as const, label: food.label, image: food.image },
    { uid: `${food.id}-word`, pair: food.id, kind: 'word' as const, label: food.label, image: food.image },
  ])), [])
  const [open, setOpen] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const flip = (uid: string) => {
    if (busy || open.includes(uid)) return
    const next = [...open, uid]
    setOpen(next)
    if (next.length < 2) return
    setBusy(true)
    const [a, b] = next.map((id) => cards.find((card) => card.uid === id)!)
    window.setTimeout(() => {
      if (a.pair === b.pair) {
        const pairs = [...matched, a.pair]
        setMatched(pairs); play(foods.find((food) => food.id === a.pair)!.audio)
        if (pairs.length === foods.length) window.setTimeout(onDone, 500)
      }
      setOpen([]); setBusy(false)
    }, a.pair === b.pair ? 430 : 800)
  }

  return <div className="challenge memory-challenge">
    <ChallengeHeader current={matched.length} total={foods.length} title={`Pairs ${matched.length} / ${foods.length}`} />
    <div className="memory-grid">{cards.map((card) => {
      const visible = open.includes(card.uid) || matched.includes(card.pair)
      return <button key={card.uid} className={visible ? 'memory-card is-open' : 'memory-card'} onClick={() => flip(card.uid)} disabled={matched.includes(card.pair)} aria-label={visible ? card.label : 'Hidden card'}>
        <span className="card-back">?</span><span className="card-face">{card.kind === 'image' ? <img src={card.image} alt={card.label} /> : <strong>{card.label}</strong>}</span>
      </button>
    })}</div>
  </div>
}

function InvitationChallenge({ play, onWrong, onDone }: ChallengeProps) {
  const targets = useMemo(() => shuffle(monsters), [])
  const [round, setRound] = useState(0)
  const [wrong, setWrong] = useState(false)
  const target = targets[round]
  const choose = (id: MonsterId) => {
    if (id !== target.id) { setWrong(true); onWrong(); window.setTimeout(() => setWrong(false), 420); return }
    play(correctAudio)
    window.setTimeout(() => round + 1 === targets.length ? onDone() : setRound(round + 1), 450)
  }
  return <div className={wrong ? 'challenge is-wrong' : 'challenge'}>
    <ChallengeHeader current={round} total={targets.length} title="Who sent this invitation?" onListen={() => play(target.welcome)} />
    <div className="invitation-options">{monsters.map((monster) => <button key={monster.id} onClick={() => choose(monster.id)}><img src={monster.portrait} alt="" /><span>TO {monster.name.toUpperCase()}</span></button>)}</div>
  </div>
}

interface ChallengeProps { play: (source: string) => void; onWrong: () => void; onDone: () => void }

function KeyAssembly({ pieces, onContinue }: { pieces: number; onContinue: () => void }) {
  return <div className="screen assembly-screen">
    <div className="assembly-orbit" />
    <p className="eyebrow">SIX MONSTERS · SIX PIECES</p>
    <h2>{pieces === 6 ? 'THE MONSTER KEY' : 'THE KEY IS NOT COMPLETE'}</h2>
    <MonsterKey pieces={pieces} />
    <p>{pieces === 6 ? 'The pieces are joined, but one final spell guards the Party Hall.' : 'Return to the house and find the missing pieces.'}</p>
    <button className="primary-button primary-button--large" onClick={onContinue}>{pieces === 6 ? 'ENTER THE MONSTER RACE' : 'RETURN TO THE HOUSE'}</button>
  </div>
}

const raceRounds = Array.from({ length: 9 }, (_, round) => {
  const shared = raceSymbols[round % raceSymbols.length]
  const withoutShared = raceSymbols.filter((symbol) => symbol.id !== shared.id)
  const left = [shared, withoutShared[(round + 1) % withoutShared.length], withoutShared[(round + 3) % withoutShared.length], withoutShared[(round + 5) % withoutShared.length]]
  const right = [shared, withoutShared[(round + 2) % withoutShared.length], withoutShared[(round + 4) % withoutShared.length], withoutShared[(round + 7) % withoutShared.length]]
  return { shared, left: shuffle(left), right: shuffle(right) }
})

function MonsterRace({ play, onComplete, onParty }: { play: (source: string) => void; onComplete: () => void; onParty: () => void }) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState([0, 0])
  const [errors, setErrors] = useState([0, 0])
  const [winner, setWinner] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const current = raceRounds[round]

  const choose = (player: 0 | 1, id: string) => {
    if (locked || winner !== null) return
    if (id !== current.shared.id) {
      setErrors((values) => values.map((value, index) => index === player ? value + 1 : value) as [number, number])
      play(wrongAudio); return
    }
    setLocked(true); play(correctAudio)
    const nextScore = score.map((value, index) => index === player ? value + 1 : value) as [number, number]
    setScore(nextScore)
    window.setTimeout(() => {
      if (round === raceRounds.length - 1) {
        setWinner(nextScore[0] === nextScore[1] ? 2 : nextScore[0] > nextScore[1] ? 0 : 1)
        onComplete()
      } else { setRound((value) => value + 1); setLocked(false) }
    }, 650)
  }

  if (winner !== null) return <div className="screen race-screen race-finish">
    <KeyRound className="activated-key" />
    <p className="eyebrow">FINAL SEAL BROKEN</p>
    <h2>{winner === 2 ? 'IT’S A DRAW!' : `PLAYER ${winner + 1} WINS!`}</h2>
    <p>{score[0]} — {score[1]}</p>
    <button className="primary-button primary-button--large" onClick={onParty}><DoorOpen /> UNLOCK PARTY HALL</button>
  </div>

  return <div className="screen race-screen">
    <div className="race-title"><span>FINAL CHALLENGE</span><h2>MONSTER RACE</h2><p>Find the one matching picture. First tap wins the round.</p></div>
    <div className="round-counter">ROUND {round + 1} / {raceRounds.length}</div>
    <div className="race-arena">
      {[0, 1].map((player) => <section className={`player-card player-card--${player + 1}`} key={player}>
        <header><span>PLAYER {player + 1}</span><strong>{score[player]} PTS</strong></header>
        <div className="race-symbols">{(player === 0 ? current.left : current.right).map((symbol) => <button key={symbol.id} onClick={() => choose(player as 0 | 1, symbol.id)} aria-label={`${symbol.label}, Player ${player + 1}`}><img src={symbol.image} alt={symbol.label} /></button>)}</div>
        <small>MISSES {errors[player]}</small>
      </section>)}
      <div className="versus">VS</div>
    </div>
  </div>
}

function PartyHall({ onExplore, onReplay, onSeen }: { onExplore: () => void; onReplay: () => void; onSeen: () => void }) {
  const [videoOpen, setVideoOpen] = useState(false)
  const seenRef = useRef(onSeen)
  useEffect(() => { seenRef.current() }, [])
  return <div className="screen party-screen">
    <div className="confetti" aria-hidden="true">{Array.from({ length: 24 }).map((_, index) => <i key={index} style={{ '--i': index } as React.CSSProperties} />)}</div>
    <div className="party-copy">
      <p className="eyebrow">THE DOOR IS OPEN</p>
      <h2>WELCOME TO THE<br /><span>MONSTER PARTY!</span></h2>
      <div className="party-monsters">{monsters.map((monster) => <img key={monster.id} src={monster.portrait} alt={monster.name} />)}</div>
      <div className="party-actions">
        <button className="primary-button" onClick={() => setVideoOpen(true)}>WATCH THE PARTY</button>
        <button className="secondary-button" onClick={onExplore}>EXPLORE THE HOUSE</button>
        <button className="text-button" onClick={onReplay}>PLAY AGAIN</button>
      </div>
    </div>
    {videoOpen && <div className="video-modal modal-backdrop"><div className="modal-card"><button className="modal-close" aria-label="Close video" onClick={() => setVideoOpen(false)}><X /></button><video src={assetUrl('assets/video/monster-party.mp4')} autoPlay controls playsInline /></div></div>}
  </div>
}

function MonsterBook({ discovered, completed, onClose }: { discovered: MonsterId[]; completed: MonsterId[]; onClose: () => void }) {
  return <div className="modal-backdrop"><section className="modal-card monster-book" role="dialog" aria-modal="true" aria-label="Monster Book">
    <button className="modal-close" aria-label="Close Monster Book" onClick={onClose}><X /></button>
    <p className="eyebrow">YOUR ADVENTURE</p><h2>MONSTER BOOK</h2>
    <div className="book-grid">{monsters.map((monster) => {
      const found = discovered.includes(monster.id) || completed.includes(monster.id)
      return <article key={monster.id} className={!found ? 'is-hidden' : ''}><div>{found ? <img src={monster.portrait} alt="" /> : '?'}</div><strong>{found ? monster.name : 'UNDISCOVERED'}</strong><small>{completed.includes(monster.id) ? '◆ KEY PIECE COLLECTED' : found ? 'Challenge waiting' : 'Explore the house'}</small></article>
    })}</div>
    <MonsterKey pieces={completed.length} />
  </section></div>
}

function SettingsPanel({ soundOn, onSound, onFullscreen, onReset, onClose }: { soundOn: boolean; onSound: () => void; onFullscreen: () => void; onReset: () => void; onClose: () => void }) {
  return <div className="modal-backdrop"><section className="modal-card settings-card" role="dialog" aria-modal="true" aria-label="Settings">
    <button className="modal-close" aria-label="Close settings" onClick={onClose}><X /></button><p className="eyebrow">MONSTER HOUSE</p><h2>SETTINGS</h2>
    <button onClick={onSound}>{soundOn ? <Volume2 /> : <VolumeX />} SOUND {soundOn ? 'ON' : 'OFF'}</button>
    <button onClick={onFullscreen}><Expand /> FULLSCREEN</button>
    <button className="danger-button" onClick={onReset}><RotateCcw /> RESET GAME</button>
  </section></div>
}

function ConfirmReset({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return <div className="modal-backdrop"><section className="modal-card confirm-card" role="alertdialog" aria-modal="true"><KeyRound /><h2>Reset all progress?</h2><p>All six pieces, room progress and the final race will be cleared.</p><div><button className="secondary-button" onClick={onCancel}>CANCEL</button><button className="danger-button" onClick={onConfirm}>YES, RESET</button></div></section></div>
}

export default App
