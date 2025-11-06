# Game Configuration Guide

## Overview

The game now uses a centralized configuration system that allows you to easily enable/disable attributes for gameplay without modifying multiple files.

## Configuration File

**Location**: `src/config/gameConfig.ts`

## How to Toggle Attributes

### Quick Start

1. Open `src/config/gameConfig.ts`
2. Find the `defaultGameConfig` object
3. Set any attribute to `false` to disable it
4. Save the file
5. The dev server will automatically reload

### Example: Disable Books/Comics

```typescript
export const defaultGameConfig: GameConfig = {
  attributes: {
    // ... other attributes ...

    // Media appearances - can be toggled
    movieAppearances: true,
    tvAppearances: true,
    gameAppearances: true,
    bookAppearances: false, // ✅ Already disabled
  },
};
```

### Example: Disable All Media Attributes

```typescript
export const defaultGameConfig: GameConfig = {
  attributes: {
    // Core attributes
    species: true,
    sex: true,
    hairColor: true,
    eyeColor: true,
    homeworld: true,
    affiliations: true,
    eras: true,
    weapons: true,
    forceUser: true,

    // Disable all media appearances
    movieAppearances: false,
    tvAppearances: false,
    gameAppearances: false,
    bookAppearances: false,
  },
};
```

### Example: Only Enable Core Attributes + Movies

```typescript
export const defaultGameConfig: GameConfig = {
  attributes: {
    // Core attributes (always keep these true)
    species: true,
    sex: true,
    hairColor: true,
    eyeColor: true,
    homeworld: true,
    affiliations: true,
    eras: true,
    weapons: true,
    forceUser: true,

    // Just movies enabled
    movieAppearances: true,
    tvAppearances: false,
    gameAppearances: false,
    bookAppearances: false,
  },
};
```

## What Changes Automatically

When you toggle attributes in the config, the following automatically update:

✅ **Attribute comparison logic** - Only enabled attributes are compared  
✅ **Grid layout** - Column count adjusts dynamically  
✅ **Header labels** - Only shows enabled attribute headers  
✅ **Guess rows** - Only displays cells for enabled attributes

## Current Default Configuration

### Core Attributes (Enabled)

- ✅ Species
- ✅ Sex
- ✅ Hair Color
- ✅ Eye Color
- ✅ Homeworld
- ✅ Affiliations
- ✅ Eras
- ✅ Weapons
- ✅ Force User

### Media Appearances

- ✅ Movie Appearances (enabled)
- ✅ TV Appearances (enabled)
- ✅ Game Appearances (enabled)
- ❌ Book/Comic Appearances (**disabled** - no data yet)

## Why Disable Attributes?

### Performance

- Fewer columns = faster rendering
- Better mobile experience with limited screen space

### Difficulty Control

- More attributes = harder game
- Fewer attributes = easier game
- Adjust difficulty for different audiences

### Data Quality

- Disable attributes with incomplete data
- Hide "None" values from gameplay
- Focus on well-populated attributes

## Common Configurations

### Easy Mode (6 attributes)

```typescript
species: true,
sex: true,
hairColor: true,
homeworld: true,
forceUser: true,
movieAppearances: true,
// Disable all others
```

### Medium Mode (9 attributes - current default without books)

```typescript
// All core attributes enabled
// Movies, TV, Games enabled
// Books/Comics disabled
```

### Hard Mode (13 attributes)

```typescript
// Enable everything (once books/comics data is added)
```

### Movie-Only Mode

```typescript
// All core attributes
movieAppearances: true,
tvAppearances: false,
gameAppearances: false,
bookAppearances: false,
```

## Display Names

You can also customize how attributes appear in the UI by editing the `attributeDisplayNames` object:

```typescript
export const attributeDisplayNames: Record<string, string> = {
  species: "Species",
  movieAppearances: "Films", // Change "Movies" to "Films"
  tvAppearances: "Shows", // Change "TV Shows" to "Shows"
  // ... etc
};
```

## Adding Future Attributes

When new attributes are added to characters:

1. Add the attribute to the `GameConfig` interface in `gameConfig.ts`
2. Add it to `defaultGameConfig` (set default enabled/disabled state)
3. Add a display name to `attributeDisplayNames`
4. The game logic automatically picks it up!

No need to modify:

- ❌ `App.tsx` (uses dynamic config)
- ❌ `GuessRow.tsx` (uses dynamic grid)
- ❌ `gameLogic.ts` (uses `getEnabledAttributes()`)

## Testing Configuration Changes

1. **Save** `gameConfig.ts`
2. **Check browser** - dev server auto-reloads
3. **Make a guess** - verify correct columns appear
4. **Check comparison** - ensure only enabled attributes are compared

## Troubleshooting

### Grid looks weird

- Make sure enabled attribute count matches grid columns
- Clear browser cache and reload

### Attribute not appearing

- Check `defaultGameConfig` - must be set to `true`
- Verify spelling matches exactly
- Check TypeScript has no errors

### Too many/few columns

- Count enabled attributes (excluding those set to `false`)
- Grid columns = enabled attributes + 1 (for image)

## Future Enhancements

Potential features to add:

- 🎮 **UI Toggle** - Allow players to customize attributes in settings
- 💾 **Save Preferences** - Remember player's attribute preferences
- 📊 **Difficulty Presets** - Easy/Medium/Hard button to quickly change config
- 🎯 **Daily Config** - Different attribute sets for different days
- 📱 **Responsive Config** - Auto-disable attributes on small screens

---

**Current Status**: Books/Comics disabled by default (no data yet). Change anytime in `src/config/gameConfig.ts`!
