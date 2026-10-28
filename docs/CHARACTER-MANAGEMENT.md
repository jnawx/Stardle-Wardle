# Character Management System

## Overview

The game now includes **1,814 Star Wars characters** from the Canon Wookieepedia! However, many characters don't have complete data yet. The new character management system allows you to:

- Enable/disable characters for the game
- View which characters have incomplete data
- Easily manage the character pool

## Files Added

- `character-manager.html` - GUI tool to manage characters
- `scripts/merge-all-characters.js` - Script that merged all Wookieepedia characters
- `scripts/fetch-via-api.js` - Script to fetch characters from Wookieepedia API
- `src/data/characters.backup.json` - Backup of your original 31 characters

## Quick Start

### 1. Start the Dev Server (Keep Running!)

**In Terminal 1:**

```bash
npm run dev
```

⚠️ **Keep this running!** Don't close this terminal.

### 2. Open the Character Manager

**Option A - Use npm script:**

```bash
npm run character-manager
```

**Option B - Use the batch file:**

```bash
.\open-character-manager.bat
```

**Option C - Open manually:**
Navigate to: http://localhost:5174/character-manager.html

**Note:** The `npm run character-manager` command will open your browser and exit immediately. This is normal! The dev server in the other terminal should stay running.

### 3. Enable/Disable Characters

The GUI allows you to:

- **Search** for specific characters
- **Filter** by enabled, disabled, or incomplete data
- **Enable All** visible characters
- **Disable All** visible characters
- **Toggle individual characters** by clicking them or their checkbox

### 4. Save Your Changes

1. Click "Save Changes" button
2. The JSON will be copied to your clipboard
3. Paste it into `src/data/characters.json`
4. Save the file
5. Refresh your game

## Character Data Structure

Each character now has:

```json
{
  "id": "character-name",
  "name": "Character Name",
  "species": "Human", // or null
  "sex": "Male", // or null
  "hairColor": "Brown", // or null
  "eyeColor": "Blue", // or null
  "homeworld": "Tatooine", // or null
  "affiliations": ["Jedi"], // or []
  "eras": ["Prequel"], // or []
  "weapons": ["Lightsaber"], // or []
  "forceUser": false,
  "source": ["movies"], // or []
  "enabled": true, // NEW: Controls if character is in the game
  "imageUrl": "https://..." // or null
}
```

## Current Status

- **Total Characters**: 1,814
- **Enabled**: 31 (your original characters)
- **Disabled**: 1,783 (new characters with incomplete/null data)
- **Incomplete Data**: 1,783 (need species, sex, homeworld, etc.)

## Game Behavior

The game now:

- ✅ **Only shows enabled characters** in the search dropdown
- ✅ **Only selects enabled characters** as the daily/random target
- ✅ **Filters by enabled=true** automatically

## Adding More Characters

To add more characters to your game:

1. Open the Character Manager
2. Search for the character (e.g., "Grogu", "Ahsoka", "Thrawn")
3. Enable the character
4. **Important**: Fill in their data (species, homeworld, etc.) in `characters.json`
5. Save your changes

## Recommended Workflow

### Adding Popular Characters

1. Enable characters you want (e.g., from The Mandalorian, Clone Wars)
2. Use Wookieepedia to look up their details
3. Manually update the JSON with correct data
4. Test in the game

### Bulk Adding

You can enable many characters at once, but remember:

- Characters with `null` values won't display properly
- You'll need to fill in data for each one
- Focus on quality over quantity

## Scripts Reference

```bash
# Fetch all characters from Wookieepedia
node scripts/fetch-via-api.js

# Merge new characters into characters.json
node scripts/merge-all-characters.js

# Fetch SWAPI characters (82 characters with complete data)
node scripts/fetch-swapi-characters.js
```

## Tips

1. **Start small**: Enable 10-20 new characters at a time
2. **Use complete data**: Prioritize characters with full information
3. **Test frequently**: Check the game after enabling new characters
4. **Backup regularly**: The merge script creates a backup, but make your own too
5. **Use filters**: The "Incomplete Data" filter shows which characters need work

## Troubleshooting

**Game shows "No enabled characters available"**

- Make sure at least some characters have `enabled: true`
- Check `characters.json` is valid JSON

**Character doesn't appear in search**

- Verify `enabled: true` in the JSON
- Refresh the page
- Check browser console for errors

**Changes not saving**

- Use the "Save Changes" button in the Character Manager
- Copy the JSON from clipboard
- Paste into `src/data/characters.json`
- Save the file

## Future Improvements

Potential enhancements:

- Auto-fetch character data from Wookieepedia
- Server-side save (avoid clipboard copy/paste)
- Bulk data editing in the GUI
- Character image management
- Data validation and completeness checker
