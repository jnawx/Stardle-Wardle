# Quote Hint and Master Hint Fields

## Overview

Added two new required fields to each character for providing gameplay hints:

- **Quote Hint**: A memorable quote from the character
- **Master Hint**: A detailed hint about the character

## Changes Made

### 1. Character Data Schema

**File**: `src/data/characters.json`

Added two new fields to all 143 characters:

- `quoteHint`: string | null (initially null)
- `masterHint`: string | null (initially null)

Field placement in schema:

```
...
forceUser: boolean
speaksBasic: boolean
quoteHint: string | null     ← NEW
masterHint: string | null    ← NEW
imageUrl: string | null
...
```

### 2. Character Manager UI

**File**: `character-manager-pro.html`

#### Added Input Fields:

- **Quote Hint**: Single-line text input

  - Label: "Quote Hint \*" (asterisk indicates required)
  - Placeholder: "Enter a memorable quote..."
  - Positioned after "Speaks Basic" field

- **Master Hint**: Multi-line textarea
  - Label: "Master Hint \*" (asterisk indicates required)
  - Placeholder: "Enter a master hint..."
  - Rows: 3 (resizable)
  - Positioned after "Quote Hint" field

#### Updated Incomplete Check:

The `isIncomplete()` function now checks these fields:

```javascript
hasNoValue(char.quoteHint) ||
hasNoValue(char.masterHint) ||
```

Characters without these fields will show as "INCOMPLETE" in the character manager.

#### Updated New Character Creation:

When creating a new character, both fields are initialized to `null`.

### 3. CSS Styling

Added styling for textarea inputs:

```css
textarea.attribute-input {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  min-height: 60px;
  resize: vertical;
}
```

## Usage

### In Character Manager:

1. Open character manager in browser
2. Each character now has two new fields:
   - **Quote Hint**: Enter a short, memorable quote
   - **Master Hint**: Enter a detailed hint (can be multiple lines)
3. Both fields are required - characters will show as incomplete without them
4. Changes are saved when clicking "💾 Save Changes"

### Field Guidelines:

- **Quote Hint**: Should be a distinctive quote the character said

  - Example: "I have a bad feeling about this"
  - Keep it concise and memorable

- **Master Hint**: Should provide enough information to identify the character
  - Can include: role, relationships, key events, characteristics
  - Can be multiple sentences
  - More detailed than quote hint

## Statistics

**Total characters**: 143
**Characters updated**: 143
**New fields per character**: 2
**Total new data points**: 286 (all currently null, to be filled in)

## Files Modified

1. `src/data/characters.json` - Added fields to all characters
2. `character-manager-pro.html` - Added UI controls and validation
3. `scripts/add-hint-fields.js` - Script for bulk field addition

## Next Steps

1. Fill in Quote Hints for all characters
2. Fill in Master Hints for all characters
3. Characters will only be complete when both hints are filled
