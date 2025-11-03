# Character Extraction Tool

This tool allows you to extract character data from Star Wars Fandom URLs and automatically populate character attributes.

## Usage

```bash
node scripts/extract-character-from-url.js <fandom-url>
```

### Examples

```bash
# Extract Luke Skywalker
node scripts/extract-character-from-url.js "https://starwars.fandom.com/wiki/Luke_Skywalker"

# Extract Darth Vader
node scripts/extract-character-from-url.js "https://starwars.fandom.com/wiki/Darth_Vader"

# Extract Han Solo
node scripts/extract-character-from-url.js "https://starwars.fandom.com/wiki/Han_Solo"
```

## What it does

1. **Downloads** the HTML from the provided Fandom URL
2. **Extracts** the character name from the URL or page title
3. **Parses** the infobox data from the Fandom page
4. **Creates/Updates** a character entry in `src/data/characters_new.json`
5. **Populates** basic attributes like:
   - Species
   - Sex/Gender
   - Hair Color
   - Eye Color
   - Homeworld
   - Affiliations
   - Force User status
   - Image URL

## Features

- **Automatic ID generation** from character names
- **Duplicate handling** - updates existing characters instead of creating duplicates
- **Selective updating** - only fills in null/empty fields to avoid overwriting manual edits
- **Error handling** - graceful failure with informative messages
- **Progress logging** - shows what's being extracted and processed

## Output

Characters are saved to `src/data/characters_new.json` with the full character schema including all required fields initialized to appropriate defaults.

## Future Enhancements

This is a baseline version. Future improvements could include:
- Media appearance extraction
- Era detection
- Weapon extraction
- More sophisticated affiliation parsing
- Quote and hint extraction
- Batch processing from URL lists
