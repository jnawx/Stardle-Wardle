# Star Wars Character-dle - Project Plan

## Overview

A Wordle-style guessing game where players try to identify a Star Wars character based on their attributes. Each guess reveals how close the guessed character's attributes are to the target character.

---

## Game Mechanics

### Core Gameplay

1. **Objective**: Guess the mystery Star Wars character in as few attempts as possible
2. **Daily Challenge**: One character per day (like Wordle) - movies only
3. **Practice Mode**: Unlimited guesses with random characters
4. **Guess Limit**: Unlimited attempts (no artificial limit)

### Character Expansion Packs (Opt-in)

Players can enable additional character pools beyond the core movie characters:

- **Movies Only** (Default - Episodes I-IX, Rogue One, Solo)
- **+ Animated Series** (Clone Wars, Rebels, Bad Batch, Resistance)
- **+ Live Action TV** (Mandalorian, Boba Fett, Obi-Wan, Ahsoka, Andor, Acolyte)
- **+ Video Games** (KOTOR, Jedi Fallen Order/Survivor, Battlefront, etc.)
- **+ Books/Comics** (Expanded Universe/Legends characters)
- **Custom Mix** (Select specific expansions)

**Note**: Daily challenge always uses movies-only pool for fairness. Expansions apply to practice mode only.

### Character Attributes to Compare (MVP - 9 Core Attributes)

1. **Species** (Human, Wookiee, Droid, Twi'lek, etc.)
2. **Sex** (Male, Female, N/A for droids)
3. **Hair Color** (Brown, Black, Blonde, Red, Gray, White, Bald, N/A)
4. **Eye Color** (Blue, Brown, Green, Yellow, Red, Orange, etc.)
5. **Homeworld** (Tatooine, Naboo, Alderaan, Coruscant, etc.)
6. **Affiliations** (Jedi, Sith, Rebel Alliance, Empire, Resistance, etc.)
7. **Eras** (Prequel, Original, Sequel trilogy)
8. **Weapons** (Lightsaber, Blaster, Bowcaster, Force, Staff, None, etc.)
9. **Force-User** (Yes/No - includes both Jedi and Sith)

### Future Attributes (Phase 2+)

- **Height** (with up/down arrows for higher/lower)
- **First Appearance** (Episode number/movie)
- **Status** (Alive, Deceased, Unknown)
- **Birth Year** (BBY/ABY for timeline placement)

### Feedback System

For each guessed character, show:

- ✅ **Green**: Exact match
- 🟨 **Yellow**: Partial match (e.g., multiple affiliations, one matches)
- ⬆️/⬇️ **Arrows**: For numerical values (height, appearance year)
- ❌ **Red/Gray**: No match

---

## Features

### MVP (Minimum Viable Product)

- [ ] Daily character challenge (movies-only pool)
- [ ] Practice mode (unlimited guesses)
- [ ] Character search/autocomplete input
- [ ] 9-attribute comparison grid (Species, Sex, Hair, Eyes, World, Affiliations, Eras, Weapons, Force-User)
- [ ] Visual feedback (color coding: green = match, yellow = partial, red = no match)
- [ ] Win state detection (no guess limit)
- [ ] Share results (spoiler-free emoji grid)
- [ ] Basic character database (50-100 movie characters with all 9 attributes)
- [ ] Character pool filtering by source (movies, TV, games, etc.)

### Phase 2 Enhancements

- [ ] Statistics tracking (games played, win rate, streak, average guesses)
- [ ] Local storage for stats and game state
- [ ] Dark/light theme toggle
- [ ] Character image reveal on win
- [ ] Hint system (reveal one attribute)
- [ ] Expanded character pools (animated series, live-action TV)
- [ ] Character expansion pack selector UI

### Phase 3 Advanced Features

- [ ] Massive character database (500+ characters across all media)
- [ ] Video games character expansion
- [ ] Books/Comics/Legends character expansion
- [ ] Era-specific challenges (Prequel-only, OT-only, etc.)
- [ ] Leaderboards (lowest average guesses)
- [ ] Custom character sets (create your own pools)
- [ ] Sound effects and animations
- [ ] Character trivia on win screen
- [ ] Mobile app version

---

## Technical Architecture

### Frontend Stack (RECOMMENDED)

**Framework:** React 18+ with TypeScript

- Component-based architecture perfect for game grid
- Excellent ecosystem and tooling
- Type safety for character data
- Easy state management with hooks

**Build Tool:** Vite

- Lightning-fast dev server and HMR
- Optimized production builds
- Better DX than Create React App
- Built-in TypeScript support

**Styling:** Tailwind CSS

- Rapid development with utility classes
- Easy to create responsive grids
- Built-in dark mode support
- Star Wars themed color palette via config
- Smaller bundle size with PurgeCSS

**State Management:** React Context + Hooks

- No need for Redux/Zustand for this app size
- useState/useReducer for game logic
- useContext for global settings (theme, expansions)
- localStorage sync with custom hooks

### Backend & Database (NOT NEEDED for MVP!)

**Good News:** You don't need a backend or database for this project! Here's why:

**Character Data:**

- Static JSON file bundled with the app (50-100 characters)
- Characters don't change frequently
- All data can be client-side (species, homeworld, etc.)
- Vite will bundle it efficiently

**Game State:**

- Browser localStorage for everything:
  - Current game progress
  - Statistics (wins, streaks, average guesses)
  - User settings (theme, enabled expansions)
  - Daily challenge completion tracking
- All processing happens in the browser

**Daily Challenge:**

- Date-based algorithm picks the character (no server needed!)
- Use `new Date()` as seed for deterministic selection
- Everyone gets same character because same date = same seed

**When You WOULD Need a Backend (Phase 3+):**

- Leaderboards (compare scores across users)
- User accounts/authentication
- Anti-cheat verification
- Real-time multiplayer
- Character data that updates frequently
- Analytics beyond what you can do client-side

**Deployment:**

- Static site hosting (Vercel, Netlify, GitHub Pages)
- Just HTML/CSS/JS files - no server required!
- Free hosting tier is perfect
- CDN delivers files globally

**Key Components:**

- `GameBoard` - Main game container
- `SearchInput` - Character autocomplete search
- `GuessRow` - Individual guess with attribute cells
- `AttributeCell` - Single attribute comparison display
- `ResultsModal` - Win/loss screen with share button
- `StatsPanel` - Statistics display
- `Header` - Logo and navigation

### Data Management

**Character Data Structure:**

```typescript
// src/data/characters.json
interface Character {
  id: string;
  name: string;
  // Core MVP Attributes
  species: string;
  sex: string;
  hairColor: string;
  eyeColor: string;
  homeworld: string;
  affiliations: string[]; // Can have multiple (e.g., ["Jedi", "Rebel Alliance"])
  eras: string[]; // Can appear in multiple (e.g., ["Prequel", "Original"])
  weapons: string[]; // Can use multiple (e.g., ["Lightsaber", "Force"])
  forceUser: boolean; // true/false
  // Metadata
  source: string[]; // ["movies", "animated", "liveTV", "games", "books"]
  // Optional/Phase 2
  height?: number;
  firstAppearance?: string;
  status?: string;
  birthYear?: string;
  imageUrl?: string;
}
```

**Data Storage (All Client-Side):**

- **characters.json** - Static file with all character data (bundled with app)
- **localStorage** - Persists:
  - Current game state (guesses, target character for today)
  - Statistics (games played, win rate, streak, average guesses)
  - User preferences (theme, enabled character expansions)
  - Daily challenge completion (which dates completed)
- **No database needed!** - Everything runs in the browser

**Daily Character Selection Algorithm:**

```typescript
// Deterministic - same date = same character for everyone
function getDailyCharacter(characters: Character[], date: Date): Character {
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const index = daysSinceEpoch % characters.length;
  return characters[index];
}
```

### Game Logic

- Date-based seed for daily character selection
- Attribute comparison algorithms
- Win/loss detection
- Share text generation (emoji grid)

---

## Data Sources

### Character Information

- **SWAPI (Star Wars API)**: Free API for character data
- **Wookieepedia**: Manual data compilation
- **Custom JSON**: Curated and formatted dataset

### Images (Optional)

- Star Wars official assets
- Community resources (with proper attribution)
- Placeholder avatars for MVP

---

## UI/UX Design

### Layout

```
┌─────────────────────────────────────┐
│        STAR WARS CHARACTER-DLE      │
│              [?] [📊]               │
├─────────────────────────────────────┤
│                                     │
│  [Search Character...]    [Enter]  │
│                                     │
│  Species│Sex│Hair│Eyes│World│Affil│Era│Weapon│Force│
│  ───────┼───┼────┼────┼─────┼─────┼───┼──────┼─────│
│   Cell  │ C │ C  │ C  │  C  │  C  │ C │  C   │  C  │
│   Cell  │ C │ C  │ C  │  C  │  C  │ C │  C   │  C  │
│                                     │
└─────────────────────────────────────┘
```

### Color Scheme (Star Wars Themed)

- Background: Dark space (#0a0a0a)
- Primary: Yellow (#FFE81F) - Star Wars logo color
- Success: Green (#4ade80)
- Partial: Yellow/Orange (#fbbf24)
- Failure: Gray (#6b7280)
- Accent: Blue (#3b82f6) - Light saber blue

### Responsive Design

- Desktop-first approach
- Mobile optimization for smaller grids
- Touch-friendly inputs

---

## Development Phases

### Phase 1: Setup & Core (Week 1)

- [ ] Initialize React + Vite + TypeScript project
- [ ] Install and configure Tailwind CSS
- [ ] Set up project structure (components, hooks, utils, data)
- [ ] Create character database JSON (50-75 movie characters)
- [ ] Build basic UI layout with Tailwind
- [ ] Implement character search/autocomplete component
- [ ] Set up routing (if needed for daily/practice modes)

### Phase 2: Game Logic (Week 2)

- [ ] Implement attribute comparison logic
- [ ] Daily character selection algorithm
- [ ] Guess validation and feedback
- [ ] Win/loss detection
- [ ] Share functionality

### Phase 3: Polish & Features (Week 3)

- [ ] Add animations and transitions
- [ ] Implement statistics tracking
- [ ] localStorage integration
- [ ] Responsive design refinement
- [ ] Testing and bug fixes

### Phase 4: Launch (Week 4)

- [ ] Final testing
- [ ] Performance optimization
- [ ] Deploy to hosting (Vercel/Netlify)
- [ ] Documentation
- [ ] Marketing materials

---

## Deployment

### Hosting Options (Static Site Hosting - No Server!)

- **Vercel** (recommended - easiest React deployment, free tier)
  - Connect GitHub repo
  - Auto-deploy on push
  - Free SSL + CDN
  - Custom domain support
- **Netlify** (great alternative, similar features)
  - Drag-and-drop deploy or Git integration
  - Free tier generous
  - Built-in form handling (if needed later)
- **GitHub Pages** (100% free option)
  - Host directly from repo
  - Custom domain support
  - Simple workflow

### CI/CD

- Automatic deployment on git push to main
- Preview deployments for pull requests
- No environment variables needed for MVP
- Build command: `npm run build`
- Output directory: `dist/`

### No Backend Infrastructure Needed!

- No server costs
- No database costs
- No API maintenance
- Scales automatically via CDN
- 99.9% uptime from hosting provider

---

## Success Metrics

### User Engagement

- Daily active users
- Average games per user
- Win rate percentage
- Average guesses to win
- Share rate

### Technical

- Page load time < 2s
- Mobile responsive score > 95
- Accessibility score > 90
- Cross-browser compatibility

---

## Future Expansion Ideas

1. **Trivia Mode**: Additional Star Wars trivia questions
2. **Quote-dle**: Guess character by their famous quotes
3. **Planet-dle**: Guess Star Wars planets/locations
4. **Ship-dle**: Guess starships
5. **Multiplayer**: Head-to-head challenges
6. **Time Attack**: Speed-based scoring
7. **Hard Mode**: Fewer attributes shown

---

## Legal Considerations

- Use publicly available character information
- Respect Star Wars intellectual property
- Attribution for data sources
- Non-commercial use (or licensing if commercial)
- Terms of service and privacy policy

---

## Questions to Decide

1. ✅ **Character Pool Size**: Start with 50-75 movie characters for daily pool
2. ✅ **Game Modes**: Daily challenge (limited pool) + Practice mode (unlimited guesses) from start
3. ✅ **Guess Limit**: Unlimited - let players guess as much as they want
4. ✅ **Attributes**: Species, Sex, Hair Color, Eye Color, Homeworld, Affiliations, Eras, Weapons, Force-User (9 total)
5. ✅ **Character Expansions**: Opt-in system for animated, TV, games, books (Phase 2-3)
6. ✅ **Tech Stack**: React + Vite (fast, modern, great DX)
7. ✅ **Styling**: Tailwind CSS (rapid development, easy theming)
8. ✅ **Character Images**: Add in Phase 2 (focus on core gameplay first)

---

## Next Steps

1. ✅ Review and finalize this plan
2. Choose tech stack
3. Set up development environment
4. Create/source character database
5. Design mockups/wireframes
6. Begin Phase 1 development

---

_May the Force be with this project!_
