# Q Desktop Pet

A cute Windows desktop pet built with Electron.

## Features

- Transparent always-on-top desktop pet window.
- Upload avatar images and turn them into local pet assets.
- Simple local background cutout for centered character images.
- 2.5D paper-character mode that keeps your uploaded image as the pet body.
- Soft/lively motion intensity controls.
- Left click poke reactions with escalating annoyance.
- Long left press petting/reward reaction.
- Hold left and right mouse buttons together to move the pet.
- Upload reaction sounds for poke, annoyed, and reward events.

## Download

Use the portable Windows package from `release/Q Desktop Pet-win32-x64.zip`.

Unzip it and run:

```text
Q Desktop Pet.exe
```

## Development

This project uses a local runtime-friendly command wrapper:

```powershell
.\run.cmd typecheck
.\run.cmd build
.\run.cmd package
.\run.cmd start
```

The app currently uses a standalone renderer build so it can run in restricted Windows environments without relying on Vite at runtime.

## Notes

The current avatar processing is local-first. It crops, resizes, preserves transparency, and removes simple edge-connected backgrounds. Future versions can add AI redraw support behind the existing avatar generator boundary.

## License

MIT
