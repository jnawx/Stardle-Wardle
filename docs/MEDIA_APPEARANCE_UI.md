# Media Appearance UI Update

## Overview

Updated the gameplay UI to display media appearances (Movies, TV Shows, Games) with individual colored rectangles showing which specific media items a character appears in.

## Visual Design

### Overall Box Colors (Match Status)

- 🟢 **Green** = Exact match with target character
- 🟡 **Yellow** = Partial match (some media overlap)
- ⚫ **Gray** = No match

### Individual Rectangles (Media Presence)

Inside each media box, there's a grid of small rectangles:

- 🟢 **Green rectangle** = Character appears in this specific media
- 🔴 **Red rectangle** = Character does NOT appear in this media

## Example

If you guess a character and see:

```
┌─────────────────┐
│ 🟡 Movies       │  ← Yellow outer box = partial match
│ 🟢🟢🟢🔴🔴🔴   │  ← 3 green (has), 3 red (doesn't have)
│ 🔴🔴🔴🔴🔴    │
└─────────────────┘
```

This tells you:

- The character appears in SOME movies (yellow = partial)
- They appear in movies 1, 2, 3 (green squares)
- They don't appear in movies 4-11 (red squares)

## Media Categories

### Movies (11 items)

- The Phantom Menace
- Attack of the Clones
- Revenge of the Sith
- A New Hope
- The Empire Strikes Back
- Return of the Jedi
- The Force Awakens
- The Last Jedi
- The Rise of Skywalker
- Rogue One
- Solo

### TV Shows (15 items)

- The Clone Wars
- Rebels
- The Mandalorian
- The Bad Batch
- The Book of Boba Fett
- Obi-Wan Kenobi
- Andor
- Ahsoka
- Tales of the Jedi
- Tales of the Empire
- The Acolyte
- Resistance
- Forces of Destiny
- Visions
- Young Jedi Adventures

### Games (10 items)

- Knights of the Old Republic
- The Old Republic
- Republic Commando
- Battlefront
- Battlefront II
- Jedi: Fallen Order
- Jedi: Survivor
- Squadrons
- Commander
- Galaxy of Heroes

### Books/Comics

Currently shows "None" as data is not populated yet.

## Technical Implementation

### Files Modified

- `src/components/GuessRow.tsx` - Main UI component

### Key Features

1. **Dynamic Grid Layout** - Automatically calculates optimal grid size based on number of media items
2. **Tooltips** - Hover over rectangles to see which specific media they represent
3. **Responsive** - Scales with the cell size
4. **Animations** - Smooth transitions and hover effects
5. **Fallback for "None"** - Characters with no media appearances show simplified "None" text

### Grid Calculation

The number of columns is calculated as `Math.ceil(Math.sqrt(mediaList.length))` to create a roughly square grid:

- 11 movies → 4×3 grid
- 15 TV shows → 4×4 grid
- 10 games → 4×3 grid

## User Experience

This design allows players to:

1. **Quickly identify match status** via outer box color
2. **Analyze specific overlaps** by examining green vs red rectangles
3. **Make informed guesses** by understanding which media categories to target
4. **Learn character appearances** through visual feedback

## Configuration

Media appearances can be toggled on/off in `src/config/gameConfig.ts`:

```typescript
movieAppearances: true,      // Enabled
tvAppearances: true,          // Enabled
gameAppearances: true,        // Enabled
bookAppearances: false,  // Disabled (no data yet)
```
