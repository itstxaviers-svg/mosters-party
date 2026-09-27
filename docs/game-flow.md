# Monsters' Party — game flow

## Core route

```text
StartScreen
  ↓ ENTER THE HOUSE
IntroScene — broken-key objective
  ↓
MonsterHouseHub
  ├─ Skeleton / Troll / Witch open at start
  ├─ Vampire / Ghost open after 2 key pieces
  ├─ Raven opens after 4 key pieces
  └─ Party Hall remains visible and locked
        ↓
Six native React challenge rooms
  ↓ one key piece per completed room
Monster Key Assembly (6/6)
  ↓
Monster Race — 2 players, 9 rounds
  ↓ completion unlocks the hall regardless of winner
Party Hall
  ↓
Final video / explore / reset-with-confirmation
```

## Room mapping

| Monster | Location | Original content retained | Challenge |
|---|---|---|---|
| Skeleton | Echo Bathroom | Character art, GIF, voice, welcome line, room art, local video | Identify speaking monsters |
| Troll | Basement Workshop | Character art, GIF, room vocabulary WAV, local video | Six shuffled room-audio prompts |
| Witch | Witch Kitchen | Character art, food images, six food WAV, local video | Audio-driven food hunt |
| Vampire | Moonlit Bedroom | Character art, “How are you?” content, tired response, local videos | Video clue + mood choice |
| Ghost | Memory Parlour | Character art and the six original food pairs | 12-card Memory game |
| Raven | Raven Tower | Character art and all six welcome/invitation lines | Match invitation voice to monster |

## State and save

`monsterPartySave_v1` stores the current location, discovered and completed monsters, collected pieces, Race completion, tutorial/finale flags and sound preference. Rooms remain replayable without awarding duplicate pieces. Reset requires confirmation.

## Navigation model

The app has one state machine, not 43 routes. Doors, rooms, the Monster Book, the visible Party Hall, the assembled key and the final seal replace the original slide-by-slide `NEXT` navigation. Genially scripts, iframes and page-switching runtime are not included.
