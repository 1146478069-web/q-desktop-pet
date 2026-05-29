# Q Desktop Pet Design

## Goal

Build a Windows desktop pet application that lets the user upload a cute/Q-style image and turn it into an interactive desktop companion. The first version focuses on a reliable local experience: transparent floating pet window, image upload and processing, simple animation, click interaction, speech bubbles, and a settings window. AI image generation is not part of the first implementation, but the code should keep a clean extension point for it.

## Product Scope

Version 1 includes:

- A transparent, frameless, always-on-top desktop pet window.
- Dragging the pet around the desktop.
- Uploading PNG, JPG, JPEG, or WebP images.
- Local avatar processing: preview, sizing, rounded/soft presentation, shadow, and storage as a pet asset.
- Switching between uploaded avatars.
- Idle animation, click bounce animation, and occasional small motion such as blink or sway.
- Short speech bubbles shown on click or randomly while idle.
- A settings window for avatar upload, avatar selection, size adjustment, topmost toggle, animation toggle, and bubble toggle.
- Local persistence for settings and avatar metadata.

Version 1 excludes:

- Real AI image generation from a reference image.
- Cloud sync, account login, marketplace features, or multi-device storage.
- Complex physics, pathfinding, desktop collision, or character state simulation.

## Recommended Stack

Use Electron with React and TypeScript.

Electron is a good fit because the app needs desktop window control: transparent window, frameless mode, always-on-top behavior, tray/menu integration, file dialogs, and local filesystem storage. React keeps the settings and pet UI easy to build and iterate. TypeScript helps keep the Electron main process, preload bridge, renderer UI, and avatar generation interfaces clear.

## Architecture

The application has three main runtime areas:

1. Electron main process
   - Owns application lifecycle.
   - Creates the pet window and settings window.
   - Controls always-on-top, transparency, tray/menu, file dialogs, and local paths.
   - Exposes safe IPC handlers to the renderer through preload.

2. Renderer UI
   - Pet window renderer: displays the active avatar, animation states, click behavior, drag region, and speech bubble.
   - Settings renderer: handles upload, previews, avatar list, size slider, toggles, and save/apply actions.

3. Local services
   - `AvatarLibrary`: stores avatar metadata and resolves local asset paths.
   - `AvatarGenerator`: interface for turning an input image into a usable pet asset.
   - `LocalAvatarGenerator`: first implementation; creates a local pet asset from uploaded image settings.
   - Future `AiAvatarGenerator`: later implementation that can call an image model and return a generated Q-style asset.
   - `SettingsStore`: persists app configuration.

## Data Flow

Avatar upload flow:

1. User opens settings.
2. User picks an image file.
3. Main process validates the file type and copies the original into app data.
4. Renderer shows a preview and lets the user adjust size/crop options.
5. `LocalAvatarGenerator` creates a processed asset for the pet window.
6. Avatar metadata is saved locally.
7. Pet window receives an IPC update and switches to the new avatar.

Pet interaction flow:

1. Pet window renders active avatar with idle animation.
2. User clicks the pet.
3. Renderer plays bounce animation.
4. Renderer chooses a line from local speech text and shows a bubble.
5. Bubble fades after a short duration.

Settings flow:

1. Settings window reads current settings from `SettingsStore`.
2. User adjusts toggles or size.
3. Settings are saved through IPC.
4. Pet window receives updated configuration without restart.

## Avatar Processing

Version 1 does not attempt full AI redraw. It should make uploaded images usable as desktop pet assets:

- Accept PNG, JPG, JPEG, and WebP.
- Normalize image dimensions to a configurable maximum.
- Preserve transparency when the source has alpha.
- Add a soft visual treatment suitable for a desktop pet: clean preview area, optional rounded mask, subtle drop shadow, and user-controlled size.
- Store generated assets under the app data directory, not inside the installation directory.

If automatic background removal is added later, it should be optional and local-first. The first version should not depend on a remote service.

## Window Behavior

Pet window:

- Transparent background.
- Frameless.
- Always on top by default.
- No taskbar entry if Electron support and user experience allow it.
- Draggable by the pet body.
- Small right-click menu with actions:
  - Open settings.
  - Toggle always on top.
  - Toggle bubbles.
  - Quit.

Settings window:

- Normal framed window.
- Compact utility layout.
- Provides upload, avatar list, size controls, and toggles.

## UI Design Direction

The app should open directly into the usable experience, not a landing page. The pet window is the main experience. Settings should feel like a small utility panel: clear, compact, and friendly.

Expected settings sections:

- Avatar preview.
- Upload/change image button.
- Avatar list.
- Size slider.
- Toggles for topmost, animation, and bubbles.
- Save/apply behavior that updates the pet immediately.

## Error Handling

Handle these cases gracefully:

- Unsupported file type: show a clear message in settings.
- Image read failure: keep the current pet unchanged.
- Missing active avatar: show a default built-in placeholder pet.
- Asset file deleted or unavailable: fall back to the default placeholder and mark the missing avatar in settings.
- IPC failure: show an error in settings and keep current state.

## Testing And Verification

Minimum verification for version 1:

- App launches.
- Pet window is transparent, frameless, visible, and draggable.
- Pet can be set always on top and toggled off.
- Settings window opens from right-click menu.
- Uploading a supported image creates a visible pet asset.
- Uploaded avatar persists after restart.
- Size changes apply to the pet window.
- Click interaction triggers animation and bubble.
- Invalid file type is rejected without breaking the active avatar.

Automated tests should cover local services where practical:

- Settings persistence.
- Avatar metadata creation.
- File type validation.
- Avatar generator interface behavior.

Manual verification is required for OS-level window behavior because transparent and always-on-top desktop behavior is environment-dependent.

## Future AI Extension

The AI generation path should be added behind the existing `AvatarGenerator` interface:

```ts
interface AvatarGenerator {
  generate(input: AvatarGenerationInput): Promise<GeneratedAvatar>;
}
```

`LocalAvatarGenerator` is used in version 1. A future `AiAvatarGenerator` can accept the same input plus prompt/style options, call an image generation API, save the generated image locally, and return the same `GeneratedAvatar` shape. This keeps settings, avatar library, and pet rendering independent from the generation provider.

## Open Decisions

The following choices can be made during implementation without changing the product scope:

- Electron builder choice and package scripts.
- Exact image-processing library, based on what installs reliably in the local environment.
- Whether the default placeholder pet is drawn in CSS/SVG or bundled as a small image asset.
- Exact speech bubble lines.

