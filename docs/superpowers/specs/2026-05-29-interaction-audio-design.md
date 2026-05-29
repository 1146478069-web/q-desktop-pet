# Interaction And Audio Design

## Goal

Add richer pet interactions and uploadable reaction audio to the desktop pet.

## Behavior

- Left short click is a poke. Pokes within five seconds increase an irritation counter.
- Poke reactions escalate:
  - 1-2 pokes: curious/neutral bubble.
  - 3-5 pokes: annoyed bubble.
  - 6+ pokes: angry bubble.
- Left long press for at least 700ms is petting/reward. It clears irritation and triggers a happy reaction.
- Holding left and right mouse buttons together enters move mode. While both are held, the pet window follows the cursor. Releasing either button ends move mode.
- A normal right click still opens the context menu.

## Audio

Settings gains a Reaction Sounds section with upload buttons for:

- Poke sound.
- Annoyed sound.
- Reward sound.

Supported files are MP3, WAV, OGG, and M4A. Files are copied into the app data directory. If a sound is not configured, the interaction still works silently.

## Implementation Notes

- Add `audioEffects` to `AppSettings`.
- Add validation for supported audio file paths.
- Add IPC handlers for choosing audio effects and for manual pet movement.
- Keep renderer playback local with `Audio(fileUrl(effect.assetPath))`.
- Update the standalone renderer because it is the current verified runtime path.

