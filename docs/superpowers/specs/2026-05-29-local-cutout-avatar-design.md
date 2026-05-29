# Local Cutout Avatar Design

## Goal

Improve avatar upload so the desktop pet uses a processed character-like asset instead of displaying the entire uploaded image as a flat picture.

## First-Stage Local Processing

- Center-crop the uploaded image to a square.
- Resize it to the configured generation size.
- Preserve existing transparency.
- For opaque images, estimate the background from the four corners and remove only edge-connected pixels close to that background color.
- Export the final pet asset as `pet.png`.

This is still local processing, not AI redraw. It works best for images where the character is centered and the background is simple. Complex backgrounds will remain partially visible until the AI redraw phase is added.

## Future AI Path

Keep the existing `AvatarGenerator` boundary so an `AiAvatarGenerator` can later replace the local processor and produce a true Q-style redraw from the uploaded reference image.

