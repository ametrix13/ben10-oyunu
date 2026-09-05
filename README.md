# Monster District Online

A browser-based action game prototype built with **vanilla JavaScript** and the **HTML5 Canvas API**, with lightweight real-time multiplayer synchronization over **MQTT/WebSockets**.

> Current status: early alpha / prototype.

## Overview

Monster District Online is an experimental browser game focused on fast movement, transformations, combat, reputation and online player presence. The project is being developed as a lightweight web game without a traditional game engine.

## Features in the current prototype

- Multiple playable forms with different stats, roles and abilities
- Health, energy, combat and skill cooldown systems
- Hero / criminal reputation progression
- Wanted level and bounty systems
- Local save data using `localStorage`
- Multiplayer room support
- Real-time player position, movement, form and wanted-state synchronization
- MQTT over secure WebSockets for online connectivity
- Remote player interpolation for smoother movement
- Automatic disconnect / stale-player cleanup

## Tech

- JavaScript
- HTML5 Canvas
- Browser Web APIs
- MQTT.js
- WebSockets
- LocalStorage

## Project structure

```text
ben10-oyunu/
└── monster-district-online/
    └── m1.js
```

`m1.js` currently contains the core gameplay state, playable forms, save system and multiplayer synchronization logic.

## Multiplayer

The prototype creates lightweight multiplayer rooms and synchronizes player state through an MQTT broker. Each player receives a temporary client ID, joins a room, publishes movement/state updates and receives nearby player updates in real time.

The synchronized state currently includes:

- Position
- Facing angle
- Selected form
- Movement state
- Wanted level
- Player name

## Current development status

This repository currently contains a source snapshot of the game logic rather than a complete packaged web build. A playable deployment requires the surrounding HTML/Canvas setup and browser-side dependencies used by the prototype.

## Goals

Planned areas for continued development include:

- Complete browser build and deployment
- Improved combat feedback and animations
- More missions and progression
- More reliable multiplayer networking
- Better mobile controls
- Cleaner project structure and modular JavaScript

## Author

**Ahmet Akgül**  
Software Engineering student interested in web development, games and interactive applications.

---

This is an independent experimental project and a work in progress.
