# Array Attribute Matching System

## Overview

Extended the matched/unmatched item display system to all array-based attributes: **Affiliations**, **Eras**, **Weapons**, and **Eye Color**. This provides consistent visual feedback across all list-type attributes.

## Attributes Using Matched/Unmatched Display

### 1. **Affiliations**

Shows which organizations/factions match between guess and target:

- 🟢 Green: Shared affiliation (e.g., both are "Jedi Order")
- 🔴 Red: Only guess has this (e.g., guess is "Rebel Alliance" but target isn't)

**Example**: Guess Luke vs Target Anakin

```
┌─────────────────────┐
│ 🟡 Affiliation      │
│ (1/2)               │
│ ✓ Jedi Order        │ ← Green (both)
│ ✗ Rebel Alliance    │ ← Red (only Luke)
└─────────────────────┘
```

### 2. **Eras**

Shows which time periods match:

- 🟢 Green: Both characters appear in this era
- 🔴 Red: Only guess appears in this era

**Example**: Guess Obi-Wan vs Target Mace Windu

```
┌─────────────────────────┐
│ 🟢 Era                  │
│ (2/2)                   │
│ ✓ The Galactic Republic │ ← Green (both)
│ ✓ The Galactic Empire   │ ← Green (both)
└─────────────────────────┘
```

### 3. **Weapons**

Shows which weapon types match:

- 🟢 Green: Both use this weapon type
- 🔴 Red: Only guess uses this weapon type

**Example**: Guess Rey vs Target Kylo Ren

```
┌──────────────────────┐
│ 🟢 Weapon            │
│ (1/1)                │
│ ✓ Melee (Lightsaber) │ ← Green (both)
└──────────────────────┘
```

### 4. **Eye Color**

Shows which eye colors match (useful for characters with heterochromia or changing eyes):

- 🟢 Green: Shared eye color
- 🔴 Red: Only guess has this eye color

**Example**: Guess Anakin vs Target Vader

```
┌───────────────┐
│ 🟡 Eyes       │
│ (1/2)         │
│ ✓ Blue/Green  │ ← Green (Anakin before)
│ ✗ Yellow/Red  │ ← Red (Vader's Sith eyes)
└───────────────┘
```

### 5. **Media Appearances**

Already implemented:

- Movies, TV Shows, Games, Books/Comics

## Visual Design

### Header Format

- Shows fraction: `X/Y`
  - X = Number of matched items (green)
  - Y = Total items the guess has

### Color Coding

- **Green items**: `bg-green-500 bg-opacity-30` with green border
  - Indicates overlap with target
  - Tooltip shows "✓"
- **Red items**: `bg-red-500 bg-opacity-30` with red border
  - Indicates no overlap with target
  - Tooltip shows "✗"

### Box Border Colors

- 🟢 **Green border** = Exact match (all items match)
- 🟡 **Yellow border** = Partial match (some items match)
- ⚫ **Gray border** = No match (no items match)

## Benefits

### 1. **Consistency**

All array attributes now use the same visual language, making the game easier to understand.

### 2. **Information Density**

Players can see:

- How many items match (header fraction)
- Which specific items match (green)
- Which specific items don't match (red)

### 3. **Strategic Value**

Helps players narrow down:

- **Affiliations**: "Target is Jedi but not Rebel"
- **Eras**: "Target appears in Republic era but not Empire"
- **Weapons**: "Target uses lightsaber but not blasters"
- **Eye Color**: "Target has blue eyes, not yellow"

### 4. **Scrollable**

If a character has many affiliations or appears in many eras, the list is scrollable while maintaining readability.

## Technical Implementation

### Conditional Rendering Logic

```typescript
const isArrayAttribute =
  Array.isArray(comparison.value) &&
  (comparison.attribute === "affiliations" ||
    comparison.attribute === "eras" ||
    comparison.attribute === "weapons" ||
    comparison.attribute === "eyeColor");
```

### Data Source

Uses the enhanced comparison data from `gameLogic.ts`:

- `comparison.matchedItems` - Items present in both guess and target
- `comparison.unmatchedItems` - Items present in guess but not target

### Fallback

Single-value attributes (species, sex, hair color, homeworld, force user) still use the traditional centered display since they don't benefit from list representation.

## Example Gameplay Scenario

**Target**: Ahsoka Tano  
**Guess**: Anakin Skywalker

**Affiliations Box** (Yellow - Partial):

- ✓ Jedi Order (Green - both)
- ✗ Galactic Republic (Military) (Red - only Anakin)

**Eras Box** (Yellow - Partial):

- ✓ The Galactic Republic (Green - both)
- ✗ The Galactic Empire (Red - only Anakin as Vader)

**Weapons Box** (Green - Exact):

- ✓ Melee (Lightsaber) (Green - both)

This immediately tells the player:

- Target is a Jedi ✓
- Target is NOT in the military ✗
- Target is from Republic era ✓
- Target is NOT in Empire era ✗
- Target uses lightsaber ✓

## Files Modified

- `src/components/GuessRow.tsx` - Added array attribute matching display
