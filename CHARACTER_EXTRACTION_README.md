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
   - Skin Color (mapped to: Light, Dark, Tan, Green, Blue, Red, Yellow, Orange, Purple, Gray, White, Pink)
   - Homeworld
   - Birth Year (e.g., "41 BBY", "19 ABY")
   - Death Year (e.g., "4 ABY", "0 BBY")
   - Height (e.g., "1.88 meters", "6 ft 2 in")
   - Mass (e.g., "84 kilograms", "185 lbs")
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

The tool intelligently maps various color descriptions to standardized categories from `data/attribute-options.json`

### Hair Color Mapping

- "black", "ebony", "raven" → Black
- "brown", "chestnut", "auburn" → Brown
- "blonde", "golden", "yellow" → Blonde
- "red", "ginger", "copper" → Red
- "gray", "grey", "silver" → Gray
- "white", "platinum" → White
- "none", "bald", "shaved" → None

### Eye Color Mapping

- "brown", "hazel", "amber" → Brown/Hazel
- "blue", "green", "turquoise", "emerald" → Blue/Green
- "yellow", "red", "orange", "gold" → Yellow/Red
- "gray", "grey", "white", "silver" → Gray/White
- "black", "dark" → Black
- "none", "blind" → None

### Skin Color Mapping

- "light", "fair", "pale" → Light
- "dark", "black", "ebony" → Dark
- "tan", "brown" → Tan
- "green", "emerald" → Green
- "blue", "azure" → Blue
- "red", "crimson" → Red
- "yellow", "gold" → Yellow
- "orange" → Orange
- "purple", "violet" → Purple
- "gray", "grey", "silver" → Gray
- "white" → White
- "pink" → Pink

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

## Intelligent Homeworld Handling

Similar to species handling, the script includes dynamic homeworld validation against the `attribute-options.json` file. When a homeworld is found that doesn't exist in the options, the script prompts for user input:

### Birth Planet Prioritization

The script now prioritizes birth planet information from the "Born" field in Fandom infoboxes over general homeworld listings. This ensures more accurate homeworld assignment based on where characters were actually born rather than just listed homeworlds.

**Priority Order:**

1. **Birth Planet** - Extracted from the "Born" field (e.g., "41 BBY, Tatooine" → "Tatooine")
2. **Homeworld Field** - Falls back to the homeworld field if no birth information is available

**Example:** Anakin Skywalker is correctly assigned "Tatooine" as his homeworld from his birth information, even though he has other homeworld associations.

### Dynamic Homeworld Validation

- **Valid Homeworlds**: Any homeworld listed in `attribute-options.json` is accepted automatically
- **Invalid Homeworlds**: Homeworlds not in the options trigger an interactive prompt
- **Multiple Homeworld Support**: Characters with multiple homeworlds (e.g., Sabine Wren: Krownest/Mandalore) are properly parsed and the first valid homeworld is selected
- **No Hardcoded Filtering**: The script relies entirely on the current attribute options

### Interactive Homeworld Prompts

When encountering a homeworld not in the attribute options, you'll be prompted with three options:

1. **Set homeworld to "Unknown"** - Uses the standard "Unknown" category
2. **Add homeworld to attribute options and use it** - Expands the homeworld list dynamically
3. **Leave homeworld as null** - Sets homeworld to null for invalid entries

### Example Interaction

```
❓ Homeworld "Tatooine" is not in the attribute options.
Choose how to handle this homeworld:
1) Set homeworld to "Unknown"
2) Add homeworld to attribute options and use it
3) Leave homeworld as null
Enter choice (1-3): 2
✅ Added "Tatooine" to homeworld options
```

This ensures comprehensive data quality control for both species and homeworld attributes.

## Physical and Biographical Attributes

The extraction tool now includes comprehensive physical and biographical data extraction from Fandom infoboxes:

### Birth and Death Years

- **Birth Year**: Extracted from the "Born" field (e.g., "41 BBY, Tatooine" → "41 BBY")
- **Death Year**: Extracted from the "Died" field (e.g., "4 ABY, DS-2 Death Star II" → "4 ABY")
- **Format**: Standardized to "XX BBY" or "XX ABY" format
- **Fallback**: Set to null if information is unavailable

### Physical Measurements

- **Height**: Extracted from the "Height" field with imperial/metric conversion cleanup
  - Example: "1.88 meters (6 ft 2 in)" → "1.88 meters"
- **Mass**: Extracted from the "Mass" field with armor weight exclusions
  - Example: "84 kilograms" or "185 lbs"
  - Special handling: Removes "in armor" qualifiers for base weight
- **Fallback**: Set to null if measurements are unavailable

### Skin Color

- **Extraction**: Pulled from the "Skin color" field in Fandom infoboxes
- **Mapping**: Intelligent pattern matching to standardized skin color categories
- **Categories**: Light, Dark, Tan, Green, Blue, Red, Yellow, Orange, Purple, Gray, White, Pink
- **Fallback**: Set to null if skin color information is not available

### Data Quality Controls

- **Null Handling**: Fields are set to null when information is genuinely unavailable
- **Text Cleaning**: Removes parenthetical information, references, and formatting artifacts
- **Validation**: Ensures extracted data meets basic quality standards before storage

## Future Enhancements

This tool has been significantly enhanced with physical and biographical attribute extraction. Future improvements could include:

- Media appearance extraction
- Era detection
- Weapon extraction
- More sophisticated affiliation parsing
- Quote and hint extraction
- Batch processing from URL lists
