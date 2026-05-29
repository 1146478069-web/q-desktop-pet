# Interaction And Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add poke/petting/move interactions and uploadable reaction sounds.

**Architecture:** Shared types and validation describe audio effects. Electron main process copies audio assets and moves the pet window via IPC. The standalone renderer owns interaction timing, irritation state, and audio playback.

**Tech Stack:** Electron, TypeScript, Vitest, standalone HTML/CSS/JS renderer builder.

---

## Tasks

- [ ] Add audio effect types and validation tests for MP3/WAV/OGG/M4A.
- [ ] Add an audio library that copies selected audio files into app data and stores them in settings.
- [ ] Add IPC handlers for choosing audio effects and for left+right drag movement.
- [ ] Update preload and renderer typings.
- [ ] Update standalone renderer for poke escalation, long-press reward, left+right move mode, and sound upload/playback UI.
- [ ] Run tests, typecheck, build, and launch verification.

