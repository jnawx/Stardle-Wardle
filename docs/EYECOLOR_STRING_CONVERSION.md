# Eye Color Conversion: Array to String

## Change Summary

Converted the `eyeColor` attribute from an array type to a simple string type, matching the pattern used for `hairColor`.

## Rationale

- **Simplification**: Characters don't need multiple eye colors in most cases
- **Consistency**: Makes `eyeColor` work the same as `hairColor` (both simple strings)
- **Better UX**: Eye color will now display as a centered value like hair, species, sex, etc.
- **Reduced Complexity**: Removes unnecessary array handling for eye colors

## Changes Made

### 1. Type Definition

**File**: `src/types/character.ts`

Changed from:

```typescript
eyeColor: string[];
```

To:

```typescript
eyeColor: string;
```

### 2. UI Component

**File**: `src/components/GuessRow.tsx`

Removed `eyeColor` from the array attributes list that get matched/unmatched treatment:

```typescript
const isArrayAttribute =
  Array.isArray(comparison.value) &&
  (comparison.attribute === "affiliations" ||
    comparison.attribute === "eras" ||
    comparison.attribute === "weapons");
```

Eye color is now excluded and displays as a simple centered value.

### 3. Character Data

**File**: `src/data/characters.json`

All 139 characters were converted from:

```json
"eyeColor": ["Blue/Green"]
```

To:

```json
"eyeColor": "Blue/Green"
```

## Display Behavior

### Before (Array)

Eye color would show in a scrollable list with matched/unmatched items:

```
┌─────────────┐
│ 🟢 Eyes     │
│ (1/1)       │
│ ✓ Blue/Green│
└─────────────┘
```

### After (String)

Eye color now displays as a simple centered value (like hair, species, etc.):

```
┌─────────────┐
│ 🟢 Eyes     │
│             │
│ Blue/Green  │
└─────────────┘
```

The box still gets the appropriate color:

- 🟢 Green = Exact match
- ⚫ Gray = No match

## Array Attributes Remaining

After this change, these attributes still use the matched/unmatched array display:

1. **Affiliations** - Organizations/factions
2. **Eras** - Time periods
3. **Weapons** - Weapon types
4. **Media Appearances** - Movies, TV, Games, Books/Comics

These benefit from showing which specific items match because characters typically have multiple values.

## Verification

All characters confirmed to have string-type eye color:

- Total characters: 139
- With string eyeColor: 139
- With array eyeColor: 0

## Benefits

1. **Cleaner display** - Eye color gets more prominent centered display
2. **Simpler logic** - No need for array comparison for eye colors
3. **Better readability** - Easier to see at a glance
4. **Consistent with hair** - Both use the same simple string pattern
