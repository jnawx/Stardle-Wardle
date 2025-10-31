# Character Auto-Population Feature

## Overview

The Character Manager now supports automatic population of character data from the Star Wars Fandom wiki. This feature can download and parse character information to automatically fill in missing details or completely populate a character's attributes.

## Features

- **Populate Missing Info**: Fill in only the empty/missing fields for a character
- **Populate All Info**: Replace all character data with fresh information from Fandom
- **Smart Caching**: Downloads are cached for 1 week to reduce server load
- **Fandom URL Storage**: Automatically saves the Fandom URL for each character (non-gameplay attribute)

## Setup

### 1. Start the API Server

The populate feature requires a local API server to handle Fandom requests:

```bash
npm run character-api
```

This will start the server on `http://localhost:3001`

**Note**: Keep this terminal window open while using the populate features.

### 2. Open the Character Manager

In a separate terminal, start the dev server and open the character manager:

```bash
npm run dev
# Then open: http://localhost:5174/character-manager-pro.html
```

## Usage

### Populate Missing Info

1. Find the character you want to update
2. Click the **🔍 Populate Missing** button
3. Confirm the action
4. Only empty fields will be filled in
5. Existing data is preserved

**Example Use Case**: You created a new character with just a name, and want to automatically fill in species, homeworld, etc.

### Populate All Info

1. Find the character you want to update
2. Click the **⚡ Populate All** button
3. Confirm the warning (this will overwrite existing data!)
4. All fields will be replaced with Fandom data

**Example Use Case**: A character's information has changed on Fandom, or you want to reset incorrect manual edits.

### What Gets Populated

The system can automatically populate:

- **Species**
- **Sex/Gender**
- **Hair Color**
- **Eye Color(s)** (multiple values supported)
- **Homeworld**
- **Affiliations** (multiple values supported)
- **Image URL** (character portrait)
- **Fandom URL** (link to the source page)

### What Doesn't Get Populated

The following fields are **not** auto-populated and must be entered manually:

- Additional Names (aliases)
- Eras
- Weapons
- Force User status
- Media Appearances (movies, TV, games, comics)
- Enabled/Disabled status

## How It Works

### 1. Caching System

When you populate a character:

- The system checks if HTML is cached in `fandom-cache/{character-id}.html`
- If the cache is less than 1 week old, it uses the cached data
- Otherwise, it downloads fresh HTML from Fandom
- Downloads are rate-limited to be respectful to Fandom servers

### 2. Data Extraction

The system:

1. Parses the Fandom infobox from the HTML
2. Extracts relevant character attributes
3. Cleans and normalizes the data
4. Maps Fandom fields to your character schema

### 3. Fandom URL Storage

Each character gets a `fandomUrl` field added automatically:

```json
{
  "id": "luke-skywalker",
  "name": "Luke Skywalker",
  "fandomUrl": "https://starwars.fandom.com/wiki/Luke_Skywalker",
  ...
}
```

This field:

- Is stored in `characters.json`
- Can be used for reference or linking
- Does **not** affect gameplay

## API Reference

### POST /api/populate-character

Populates character information from Fandom.

**Request Body:**

```json
{
  "characterId": "luke-skywalker",
  "characterName": "Luke Skywalker",
  "populateAll": false,
  "currentData": {
    "species": "Human",
    "sex": null,
    "hairColor": null
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "hairColor": "Blonde",
    "eyeColor": ["Blue"],
    "homeworld": "Tatooine"
  },
  "fromCache": true,
  "fandomUrl": "https://starwars.fandom.com/wiki/Luke_Skywalker"
}
```

### GET /health

Check if the API server is running.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-10-30T12:34:56.789Z"
}
```

## File Structure

```
scripts/
├── character-api-server.js      # Express API server
├── populate-character-api.js    # Core population logic
└── download-fandom-pages.js     # Bulk HTML downloader (optional)

fandom-cache/
└── {character-id}.html          # Cached HTML files (auto-managed)

character-manager-pro.html       # Updated UI with populate buttons
```

## Troubleshooting

### "API Server Not Running" Error

**Problem**: Clicking populate buttons shows an error about the server not running.

**Solution**:

```bash
npm run character-api
```

Keep the terminal open.

### "Failed to download" Error

**Problem**: The system couldn't fetch data from Fandom.

**Possible Causes**:

- No internet connection
- Fandom is down or blocked
- Character name doesn't match Fandom URL format
- Rate limiting (too many requests)

**Solution**:

- Check your internet connection
- Wait a few minutes and try again
- Verify the character name matches Fandom exactly

### Incorrect Data Populated

**Problem**: The populated data doesn't look right.

**Possible Causes**:

- Fandom page has non-standard formatting
- Multiple characters with similar names
- Character info is in an unexpected format

**Solution**:

- Manually verify and correct the data
- Report the issue so parsing can be improved
- Use "Populate Missing" instead of "Populate All" to preserve good data

### Cache is Stale

**Problem**: Character data on Fandom changed but you're getting old data.

**Solution**:

- Delete the cache file: `fandom-cache/{character-id}.html`
- The next populate will download fresh data

## Advanced Usage

### Command-Line Testing

You can test the populate API directly:

```bash
node scripts/populate-character-api.js luke-skywalker "Luke Skywalker"
```

Options:

- `--all`: Populate all fields (ignore existing data)

### Bulk Population

To populate all characters at once, you could create a script that calls the API for each character. However, be respectful of Fandom's servers:

1. Use the cached HTML when available
2. Add delays between requests (1-2 seconds)
3. Run during off-peak hours if possible

### Manual Cache Management

Cache files are in `fandom-cache/`:

- Delete specific file: Remove `{character-id}.html`
- Clear all cache: Delete all `.html` files in the directory
- Check cache age: Look at file modification time

## Best Practices

1. **Use "Populate Missing" First**: It's safer and preserves your manual work
2. **Review Before Saving**: Always check populated data before saving to characters.json
3. **Keep API Server Running**: Start it once and leave it running while editing
4. **Don't Spam**: Wait a few seconds between populate requests
5. **Cache is Good**: Don't delete cache unless you need fresh data

## Future Enhancements

Potential improvements:

- Populate media appearances automatically
- Batch populate multiple characters
- Conflict resolution UI for differing data
- Alternative data sources beyond Fandom
- Eras and weapons detection from text

## License

This feature uses public data from the Star Wars Fandom wiki. Please respect their terms of service and don't abuse the API.
