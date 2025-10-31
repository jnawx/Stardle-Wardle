# Row Height and Readability Improvements

## Problem

The guess rows at 100px height were too cramped for the matched/unmatched item lists:

- Items were squeezed horizontally
- With multiple items, vertical scrolling was difficult
- Font sizes were too small (9px-10px)
- Not enough padding between elements

## Solution

### 1. Increased Row Height

**Changed from:** `h-[100px]`  
**Changed to:** `h-[180px]`

This provides 80% more vertical space (80px increase), allowing:

- More items visible without scrolling
- Better spacing between items
- Improved readability overall

### 2. Increased Font Sizes

#### Headers

- **Before:** `text-[10px]` (10px)
- **After:** `text-xs` (12px)
- **Impact:** Labels like "Movies (3/11)" are more readable

#### List Items

- **Before:** `text-[9px]` (9px)
- **After:** `text-[10px]` (10px)
- **Impact:** Media titles and affiliations are easier to read

### 3. Improved Spacing

#### Container Padding

- **Before:** `p-1.5` (6px)
- **After:** `p-2` (8px)
- **Impact:** More breathing room around content

#### Header Margin

- **Before:** `mb-1` (4px)
- **After:** `mb-1.5` (6px)
- **Impact:** Better separation between header and items

#### Item Spacing

- **Before:** `space-y-0.5` (2px), `py-0.5` (2px vertical padding)
- **After:** `space-y-1` (4px), `py-1` (4px vertical padding)
- **Impact:** Items don't feel crammed together

#### Item Padding

- **Before:** `px-1` (4px horizontal)
- **After:** `px-1.5` (6px horizontal)
- **Impact:** Text has more room to breathe

#### Line Height

- **Before:** `leading-tight` (1.25)
- **After:** `leading-snug` (1.375)
- **Impact:** Better text spacing within items

## Visual Comparison

### Before (100px height, 9px text)

```
┌──────────────┐
│Movies (3/7)  │← Hard to read
│The Clone War │← Cramped
│Rebels        │← Small
│Ahsoka        │
└──────────────┘
```

### After (180px height, 10-12px text)

```
┌─────────────────┐
│  Movies (3/7)   │ ← Readable header
│                 │
│ The Clone Wars  │ ← More space
│                 │
│ Rebels          │ ← Comfortable
│                 │
│ Ahsoka          │ ← Easy to read
│                 │
└─────────────────┘
```

## Benefits

1. **Better Readability**

   - Larger fonts make text easier to read at a glance
   - More space reduces eye strain

2. **Improved Scannability**

   - Can quickly identify green (matched) vs red (unmatched) items
   - Headers stand out more clearly

3. **Less Cramped Feel**

   - Items have room to breathe
   - The UI feels more polished and professional

4. **Better Mobile Experience**

   - Larger touch targets
   - Easier to read on smaller screens

5. **Accommodates More Content**
   - Characters with many affiliations/media now fit better
   - Scrolling is smoother with more visible items

## Technical Details

**Files Modified:**

- `src/components/GuessRow.tsx`

**CSS Classes Updated:**

- Row container: `h-[100px]` → `h-[180px]`
- Cell padding: `p-1.5` → `p-2`
- Header text: `text-[10px]` → `text-xs`
- Header margin: `mb-1` → `mb-1.5`
- List text: `text-[9px]` → `text-[10px]`
- List line height: `leading-tight` → `leading-snug`
- List spacing: `space-y-0.5` → `space-y-1`
- Item padding: `px-1 py-0.5` → `px-1.5 py-1`

## Affected Attributes

All array-based attributes with matched/unmatched display:

- ✅ **Affiliations**
- ✅ **Eras**
- ✅ **Weapons**
- ✅ **Movies**
- ✅ **TV Shows**
- ✅ **Games**

Regular attributes (species, hair, eyes, etc.) maintain their centered display and also benefit from the increased row height.
