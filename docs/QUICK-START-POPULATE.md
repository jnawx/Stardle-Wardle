# Character Auto-Population - Quick Start

## 🚀 Quick Setup (2 Steps)

### Step 1: Start the API Server

```bash
npm run character-api
```

**Keep this terminal running!** The server runs on `http://localhost:3001`

### Step 2: Use the Character Manager

1. Open the character manager: `http://localhost:5174/character-manager-pro.html`
2. Find any character
3. Click either:
   - **🔍 Populate Missing** - Fill in empty fields only
   - **⚡ Populate All** - Replace ALL data with Fandom info

## 📝 What It Does

- Automatically downloads character data from Star Wars Fandom wiki
- Parses the infobox to extract character attributes
- Caches downloads for 1 week (respects Fandom servers)
- Adds `fandomUrl` to each character for reference

## ✅ What Gets Populated

- Species
- Sex/Gender
- Hair Color
- Eye Color(s)
- Homeworld
- Affiliations
- Image URL
- Fandom URL (new field, non-gameplay)

## ❌ What Doesn't Get Populated (Manual Only)

- Additional Names (aliases)
- Eras
- Weapons
- Force User status
- Media Appearances
- Enabled/Disabled status

## 💡 Tips

1. **Use "Populate Missing" first** - safer, preserves your data
2. **Review before saving** - always check populated data
3. **Cache is good** - downloads cached for 1 week
4. **Be patient** - downloads may take a few seconds
5. **Server must be running** - keep `npm run character-api` terminal open

## 🐛 Troubleshooting

**"API Server Not Running" error?**

```bash
npm run character-api
```

**Getting old data?**
Delete the cache file: `fandom-cache/{character-id}.html`

**Can't connect to Fandom?**
Check your internet connection and wait a few minutes.

## 📖 Full Documentation

See [CHARACTER-AUTO-POPULATION.md](./CHARACTER-AUTO-POPULATION.md) for complete details.

## 🧪 Test from Command Line

```bash
node scripts/populate-character-api.js darth-bane "Darth Bane"
node scripts/populate-character-api.js luke-skywalker "Luke Skywalker" --all
```

---

**Created**: October 30, 2025  
**Version**: 1.0.0
