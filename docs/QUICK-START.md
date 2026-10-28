# ⚠️ Quick Start for Character Manager

## The Issue

The `npm run character-manager` command opens your browser and exits immediately. **This is normal!**

## The Solution - Two Terminal Workflow

### Terminal 1: Dev Server (Keep Running!)

```bash
npm run dev
```

**Don't close this!** Leave it running in the background.

### Terminal 2: Open Character Manager

```bash
npm run character-manager
```

This will open your browser to http://localhost:5174/character-manager.html and exit.

## Alternative: Use the Batch File

```bash
.\open-character-manager.bat
```

## Or Just Bookmark This

With dev server running, go to: **http://localhost:5174/character-manager.html**

---

The dev server (Terminal 1) serves both:

- Your game at http://localhost:5174/
- Character Manager at http://localhost:5174/character-manager.html

As long as the dev server is running, you can open/close the character manager page anytime! 🎮
