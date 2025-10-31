# Media Appearance Color Coding Fix

## Problem

The media appearance boxes weren't showing individual item colors correctly. When guessing Ahsoka with target Hondo Ohnaka, "The Clone Wars" should have shown as green (both characters appear in it), but all items were showing as black.

## Root Cause

The `GuessRow` component only received the guessed character's media list, not which specific items matched the target. The comparison logic determined overall match status (exact/partial/none) but didn't track individual item matches.

## Solution

### 1. Enhanced Type Definition

Updated `AttributeComparison` interface to include matched/unmatched item tracking:

```typescript
export interface AttributeComparison {
  attribute: AttributeKey;
  value: string | string[] | boolean | undefined;
  match: MatchResult;
  // NEW: Track which items matched and which didn't
  matchedItems?: string[];
  unmatchedItems?: string[];
}
```

### 2. Updated Comparison Logic

Modified `compareValues()` in `gameLogic.ts` to return detailed match information:

```typescript
function compareValues(
  guessValue: string | string[] | boolean | undefined,
  targetValue: string | string[] | boolean | undefined
): { match: MatchResult; matchedItems?: string[]; unmatchedItems?: string[] };
```

For arrays, it now:

- Tracks which items from the guess exist in the target (matchedItems)
- Tracks which items from the guess don't exist in the target (unmatchedItems)
- Returns this information along with the overall match result

### 3. Visual Representation

Updated `GuessRow.tsx` to use the new data:

**Header**: Shows `Label (X/Y)` where:

- X = number of matched items (green)
- Y = total items the character appears in

**Matched Items** (Green):

- Green background with green border
- Tooltip: "MediaName ✓ (Match!)"
- These appear in BOTH the guess and target

**Unmatched Items** (Red):

- Red background with red border
- Tooltip: "MediaName ✗ (No match)"
- These appear in the guess but NOT in the target

## Example

If you guess **Ahsoka** and the target is **Hondo Ohnaka**:

```
┌──────────────────────┐
│ 🟡 TV (1/7)          │  ← Yellow box = partial match
│                      │
│ ✓ The Clone Wars     │  ← Green (both have it)
│ ✗ Rebels             │  ← Red (only Ahsoka has it)
│ ✗ Tales of the Jedi  │  ← Red (only Ahsoka has it)
│ ✗ Ahsoka             │  ← Red (only Ahsoka has it)
│ ...                  │
└──────────────────────┘
```

This tells you:

- Overall: Yellow box = partial TV match
- The Clone Wars: Both characters appear ✓
- Other shows: Only Ahsoka appears ✗

## Benefits

1. **Clear Visual Feedback**: Green = shared media, Red = not shared
2. **Strategic Information**: Players can see exactly which media overlaps
3. **No Answer Spoiling**: Only shows what the guess has, colored by whether it matches
4. **Informative Tooltips**: Hover to confirm match status

## Files Modified

- `src/types/character.ts` - Added matchedItems/unmatchedItems to AttributeComparison
- `src/utils/gameLogic.ts` - Enhanced compareValues() to track item matches
- `src/components/GuessRow.tsx` - Updated rendering to show color-coded items
