# Local Cutout Avatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make uploaded avatar images become processed pet assets through local crop, resize, and simple background removal.

**Architecture:** Add pure image cutout helpers with unit tests. Use Electron `nativeImage` only for decoding/cropping/resizing, then encode the processed RGBA pixels to PNG.

**Tech Stack:** Electron `nativeImage`, TypeScript, Vitest, pngjs.

---

## Tasks

- [ ] Add `pngjs` dependency for PNG encoding.
- [ ] Add tests for background-color estimation and edge-connected background removal.
- [ ] Implement pure cutout helpers.
- [ ] Update `ElectronImageProcessor` to crop, resize, cut out, and save `pet.png`.
- [ ] Run tests, typecheck, build, and launch verification.

