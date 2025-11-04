# Character Extraction Tool

This tool allows you to extract character data from Star Wars Fandom URLs and automatically populate character attributes with intelligent color matching and safety controls.

## Usage

```bash
node scripts/extract-character-from-url.js [--force-update] <fandom-url>
```

### Examples

```bash
# Extract Luke Skywalker (creates disabled character)
node scripts/extract-character-from-url.js "https://starwars.fandom.com/wiki/Luke_Skywalker"

# Extract Darth Vader
node scripts/extract-character-from-url.js "https://starwars.fandom.com/wiki/Darth_Vader"

# Force update an existing enabled character
node scripts/extract-character-from-url.js --force-update "https://starwars.fandom.com/wiki/Han_Solo"
```

## What it does

1. **Downloads** the HTML from the provided Fandom URL
2. **Extracts** the character name from the URL or page title
3. **Parses** the infobox data from the Fandom page
4. **Intelligently maps** raw color descriptions to standardized categories
5. **Creates/Updates** a character entry in `src/data/characters_new.json`
6. **Populates** basic attributes like:
   - Species
   - Sex/Gender
   - Hair Color (mapped to: Black, Brown, Blonde, Red, Gray, White, None)
   - Eye Color (mapped to: Brown/Hazel, Blue/Green, Yellow/Red, Gray/White, Black, None)
   - Homeworld
   - Affiliations
   - Force User status
   - Image URL

## Features

- **Automatic ID generation** from character names
- **Intelligent color matching** - converts raw text like "brownish black" to standardized categories
- **Safety controls** - new characters are created disabled by default to prevent accidental game inclusion
- **Duplicate protection** - enabled characters cannot be updated without explicit `--force-update` flag
- **Selective updating** - only fills in null/empty fields to avoid overwriting manual edits
- **Error handling** - graceful failure with informative messages
- **Progress logging** - shows what's being extracted and processed

## Safety Features

- **Disabled by default**: New characters are created with `enabled: false` to prevent accidental inclusion in the game
- **Protected updates**: Existing enabled characters cannot be modified without the `--force-update` flag
- **Conservative merging**: Only updates null/empty fields to preserve manual customizations

## Color Mapping Examples

The tool intelligently maps various color descriptions to standardized categories:

**Hair Colors:**

- "black", "ebony", "raven" → "Black"
- "brown", "chestnut", "auburn" → "Brown"
- "blonde", "golden", "yellow" → "Blonde"
- "red", "ginger", "copper" → "Red"
- "gray", "grey", "silver" → "Gray"
- "white", "platinum" → "White"
- "none", "bald", "shaved" → "None"

**Eye Colors:**

- "brown", "hazel", "amber" → "Brown/Hazel"
- "blue", "green", "turquoise", "emerald" → "Blue/Green"
- "yellow", "red", "orange", "gold" → "Yellow/Red"
- "gray", "grey", "white", "silver" → "Gray/White"
- "black", "dark" → "Black"
- "none", "blind" → "None"

## Intelligent Species Handling

The script includes smart species detection that dynamically checks against the `attribute-options.json` file. When a species is found that doesn't exist in the options, the script prompts for user input:

### Dynamic Species Validation
- **Valid Species**: Any species listed in `attribute-options.json` is accepted automatically
- **Invalid Species**: Species not in the options trigger an interactive prompt
- **No Hardcoded Filtering**: The script relies entirely on the current attribute options

### Interactive Prompts
When encountering a species not in the attribute options, you'll be prompted with three options:

1. **Set species to "Unknown"** - Uses the standard "Unknown" category
2. **Add species to attribute options and use it** - Expands the species list dynamically
3. **Leave species as null** - Sets species to null for invalid entries

### Example Interaction
```
❓ Species "Yoda's species" is not in the attribute options.
Choose how to handle this species:
1) Set species to "Unknown"
2) Add species to attribute options and use it
3) Leave species as null
Enter choice (1-3): 2
✅ Added "Yoda's species" to species options
```

This ensures data quality while allowing flexibility for unique or new species.

## Future Enhancements

This is a baseline version. Future improvements could include:

- Media appearance extraction
- Era detection
- Weapon extraction
- More sophisticated affiliation parsing
- Quote and hint extraction
- Batch processing from URL lists
