# ⭐ Stardle-Wardle

A Wordle-style guessing game where players try to identify a mystery Star Wars character based on their attributes. Each guess reveals how close the guessed character's attributes are to the target character.

Play Now at https://stardle-wardle.nawx.app/

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

## 🎮 How to Play

1. **Search** for a Star Wars character using the search box
2. **Submit** your guess to see how it compares to the mystery character
3. **Analyze** the color-coded feedback:
   - 🟢 **Green** - Exact match
   - 🟡 **Yellow** - Partial match (e.g., one of multiple affiliations matches)
   - ⚫ **Gray** - No match
4. **Keep guessing** until you find the mystery character!

## ✨ Features

### Core Gameplay

- 🎯 Daily character challenge with a new mystery character each day
- 🔄 Unlimited guesses - no artificial limits
- 📊 9-attribute comparison system:
  - Species, Sex, Hair Color, Eye Color
  - Homeworld, Affiliations, Eras
  - Weapons, Force-User status

### Statistics & Sharing

- 📈 Track your games played, win rate, and streaks
- 📊 Guess distribution chart
- 📤 Share your results with spoiler-free emoji grids
- 💾 Progress saved locally in your browser

### Visual Polish

- 🎨 Animated UI with flip, slide, and fade effects
- 🌟 Star Wars themed dark color scheme
- 📱 Responsive design for all devices
- 🖼️ Character images revealed on win

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (22.12 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jnawx/Stardle-Wardle.git
cd Stardle-Wardle

# Install dependencies
npm ci

# Start the development server
npm run dev
```

The game will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

### Run with Docker

```bash
docker build -t starwarsdle .
docker run --rm -p 8080:80 starwarsdle
```

Open `http://localhost:8080`. The image builds the app with Node.js 22 and
serves the production files with Nginx. Character management and data-import
tools run separately on your development machine.

### Documentation

- [Quick start](docs/QUICK-START.md)
- [Character management](docs/CHARACTER-MANAGEMENT.md)
- [Game configuration](docs/GAME_CONFIG_GUIDE.md)
- [Character images](docs/IMAGES.md)
- [Historical plans and feature notes](docs/plans/)

Generated builds, dependencies, Fandom caches, local environment files, and
character backups are ignored by Git. Run `node scripts/extract-sources.js`
to regenerate the ignored `sources.txt` report.

## 🛠️ Tech Stack

| Technology         | Purpose                      |
| ------------------ | ---------------------------- |
| **React 19**       | UI framework with hooks      |
| **TypeScript**     | Type-safe development        |
| **Vite 7**         | Fast build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling        |
| **localStorage**   | Client-side persistence      |

**No backend required!** - This is a fully static site that can be deployed anywhere.

## 📁 Project Structure

```
StarWarsdle/
├── src/
│   ├── App.tsx           # Main game component
│   ├── main.tsx          # React entry point
│   ├── index.css         # Global styles
│   ├── components/       # React components
│   ├── config/           # Game configuration
│   ├── data/             # Character database
│   │   └── characters.json  # 164 Star Wars characters
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions (stats, etc.)
├── scripts/              # Development scripts
├── docs/                 # Additional documentation
├── fandom-cache/         # Cached Wookieepedia data
└── public/               # Static assets
```

## 🎲 Character Database

The game includes **164 Star Wars characters** from various media sources:

| Source       | Examples                                           |
| ------------ | -------------------------------------------------- |
| **Movies**   | Episodes I-IX, Rogue One, Solo                     |
| **TV Shows** | The Mandalorian, Clone Wars, Rebels, Ahsoka, Andor |
| **Games**    | KOTOR, Jedi: Fallen Order/Survivor, Battlefront    |

### Character Attributes

Each character has the following attributes:

- **Species** - Human, Wookiee, Droid, Twi'lek, etc.
- **Sex** - Male, Female, N/A (for droids)
- **Hair Color** - Brown, Black, Blonde, Gray, Bald, N/A
- **Eye Color** - Blue, Brown, Green, Yellow, etc.
- **Homeworld** - Tatooine, Coruscant, Naboo, etc.
- **Affiliations** - Jedi Order, Galactic Empire, Rebel Alliance, etc.
- **Eras** - The Republic, The Galactic Empire, The New Republic
- **Weapons** - Lightsaber, Ranged (Blaster), Melee, etc.
- **Force-User** - Yes/No

## 🔧 Development

### Available Scripts

| Command                     | Description                               |
| --------------------------- | ----------------------------------------- |
| `npm run dev`               | Start development server                  |
| `npm run build`             | Build for production                      |
| `npm run preview`           | Preview production build                  |
| `npm run character-manager` | Open character management tool            |
| `npm run populate-data`     | Populate character data from Fandom cache |

### Character Manager

A built-in tool for managing the character database:

```bash
# Start the dev server first
npm run dev

# Then open the character manager
npm run character-manager
```

Or simply navigate to `http://localhost:5173/character-manager-pro.html`

## 🌐 Deployment

This is a static site that can be deployed to any hosting provider:

- **Vercel** (recommended) - Connect your GitHub repo for automatic deployments
- **Netlify** - Drag-and-drop or Git integration
- **GitHub Pages** - Free hosting directly from your repo

Build command: `npm run build`  
Output directory: `dist/`

## 📜 License

This project is for educational and entertainment purposes. Star Wars and all related characters are trademarks of Lucasfilm Ltd.

## 🙏 Acknowledgments

- Character data sourced from [Wookieepedia](https://starwars.fandom.com/)
- Inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html)
- Built with ❤️ for Star Wars fans

---

_May the Force be with you!_ ✨
