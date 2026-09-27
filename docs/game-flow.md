# Monsters' Party — reconstructed flow

The React app follows the playable sequence of the original Genially export. Repeated feedback slides and six duplicated orphan slides are represented as state changes instead of separate routes.

```text
Welcome to Monsters' House
  → haunted house
  → meet six animated monsters
  → local intro video
  → random voice deck (12 correct cards)
  → monster video
  → How are you? (six original audio prompts)
  → feelings video
  → 60-second video challenge
  → food vocabulary (six original words)
  → 12-card food Memory
  → 7-second challenge
  → six room invitations + six character videos
  → Race introduction
  → two-player Race (nine rounds)
  → two local finale videos
  → final Monsters' Party scene
```

## Runtime model

- One saved `scene` index replaces Genially's page-switching runtime.
- The voice deck is shuffled, non-repeating and requires 12 correct answers.
- Feelings use the six WAV files from original scene 20.
- Food vocabulary and Memory use the six original food objects and recordings.
- Invitation rounds alternate an illustrated room challenge with that monster's local video.
- Race has two independent player panels, one shared symbol per round and nine rounds.
- `monsterPartyOriginalSave_v2` stores the current scene and sound preference.
- All media is local; the app contains no Genially runtime, iframe or Vimeo dependency.

## Visual mapping

The main scene backgrounds come directly from the export: title, house, graveyard deck, feelings room, food rooms, six character rooms, Race room and final party. They are resized from 1536×1024 to 1152×768 JPEG at build preparation time. Animated character WebP files preserve the original GIF motion.
