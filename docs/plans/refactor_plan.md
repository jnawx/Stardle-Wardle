# Animation System Refactoring Plan

## Current Problems

1. ❌ **7 boolean animation flags** with complex interactions (`showGuess`, `slideCharacter`, `showNewTags`, `applyTagColorTransitions`, `fadeOutGrayTags`, `slideTagsTogether`, `applyBoxColors`)
2. ❌ **Scattered timing calculations** (`cascadeDuration + 500 + 700 + 200 + 700...`)
3. ❌ **Navigation flash bugs** (reuses animation flags meant for new guesses)
4. ❌ **Gray tags appearing incorrectly** when navigating to previous guesses
5. ❌ **Confusing state comparisons** (prevTagStates vs tagStates vs displayState)
6. ❌ **Box color flashing** (prevExactMatch checks don't always work correctly)

---

## Proposed Solution: State Machine Architecture

### Core Concept: Single Animation Phase

Replace 7 boolean flags with a single state machine that tracks animation progress:

```typescript
type AnimationPhase =
  | "hidden" // Not visible yet (100ms - prevents flash)
  | "cascade" // Rows cascading in (2400ms)
  | "slideNew" // New items sliding right → (500ms)
  | "colorTransition" // Tag colors changing (700ms)
  | "fadeGray" // Gray tags fading out (700ms)
  | "consolidate" // Remaining tags sliding together (300ms)
  | "updateBoxes" // Category box colors update (instant)
  | "slideCharacter" // Character slides in (700ms, win only)
  | "complete"; // All animations done

const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("hidden");
```

**Benefits:**

- ✅ Clear sequential flow (no phase overlap)
- ✅ Easy to debug (check one variable: `animationPhase`)
- ✅ Simple comparisons (`phase >= 'colorTransition'`)
- ✅ Self-documenting code

---

## Animation Sequence

### For NEW Guesses:

```
Phase           Duration    What Happens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hidden          100ms       Guess panel hidden (prevents flash)
cascade         2400ms      Rows fade in sequentially
slideNew        500ms       New items slide from left to right
colorTransition 700ms       Tags change color with pulse animation
fadeGray        700ms       Gray tags fade to invisible
consolidate     300ms       Remaining tags slide together
updateBoxes     instant     Category boxes update to green (if exact)
slideCharacter  700ms       Character image/name slides in (WIN ONLY)
complete        ∞           All animations finished
```

**Total duration for new guess:** ~4.7 seconds (+ 700ms if winning)

### For NAVIGATION:

```
Phase           Duration    What Happens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
complete        instant     Jump directly to final state (no animations)
```

---

## Phase Timing Constants

```typescript
const PHASE_DURATIONS = {
  hidden: 100,
  cascade: 2400,
  slideNew: 500,
  colorTransition: 700,
  fadeGray: 700,
  consolidate: 300,
  slideCharacter: 700,
};
```

These constants make it easy to adjust timing without hunting through code.

---

## Data Flow Simplification

### What We Compare:

- **`previousGuess.tagStatesSnapshot`** → Tag states BEFORE this guess
- **`latestGuess.tagStatesSnapshot`** → Tag states AFTER this guess
- **`knowledge`** → Current accumulated knowledge (always latest)

### Knowledge Panel Rules:

1. **Always shows CURRENT accumulated knowledge** (not historical)
2. **Filter visible tags:**
   - ✅ Show: `confirmed-match` (green) and `unconfirmed` (orange)
   - ❌ Hide: `confirmed-non-match` (gray) and `unguessed`
   - 🔄 Exception: During `fadeGray` phase, briefly show gray tags for animation

### Navigation Behavior:

- Jump directly to `complete` phase
- No animations
- Show final state instantly
- No flashing or intermediate states

---

## Rendering Logic by Phase

### Guess Side (Left Panel):

| Phase                 | Behavior                                               |
| --------------------- | ------------------------------------------------------ |
| `hidden`              | `opacity-0` (invisible)                                |
| `cascade`             | `fade-in-down` animation with staggered delays per row |
| `slideNew` and beyond | Fully visible                                          |

### Knowledge Side (Right Panel):

#### Tags:

| Phase               | Behavior                                                       |
| ------------------- | -------------------------------------------------------------- |
| `hidden`, `cascade` | Show tags with previous state colors                           |
| `slideNew`          | New tags slide in from left with animation                     |
| `colorTransition`   | Tags pulse and transition colors (orange→green or orange→gray) |
| `fadeGray`          | Gray tags fade out with opacity/scale animation                |
| `consolidate`       | Remaining tags get position transition, slide together         |
| `complete`          | Final state                                                    |

#### Category Boxes:

| Phase                    | Behavior                                                 |
| ------------------------ | -------------------------------------------------------- |
| Before `updateBoxes`     | Use previous state (`prevVisibleTags`, `prevExactMatch`) |
| `updateBoxes` and beyond | Use current state (`visibleTags`, `exactMatch`)          |

---

## Implementation Steps

### Phase 1: Restore & Add New System (Parallel)

1. ✅ **Undo broken changes** - Restore working ComparisonView
2. ✅ **Add AnimationPhase type** - Define the enum
3. ✅ **Add animationPhase state** - Alongside existing 7 boolean states
4. ✅ **Add PHASE_DURATIONS constants** - Centralize timing
5. ✅ **Create phase transition useEffect** - Controls both old and new states
6. ✅ **Test that existing animations still work**

### Phase 2: Update Rendering Logic

7. ✅ **Update guess panel rendering** - Check `animationPhase` for opacity
8. ✅ **Update tag filtering logic** - Simplify using `animationPhase`
9. ✅ **Update tag rendering** - Add phase-based animations
10. ✅ **Update box color logic** - Use phase-based state selection
11. ✅ **Update navigation logic** - Jump to `complete` instantly
12. ✅ **Test all animations work correctly**

### Phase 3: Clean Up & Optimize

13. ✅ **Remove old boolean states** - Once new system proven
14. ✅ **Remove complex timing calculations** - Use PHASE_DURATIONS
15. ✅ **Simplify tagsToFadeOut logic** - Use phase checks
16. ✅ **Update comments and documentation**
17. ✅ **Final testing** - All scenarios (new guess, navigation, winning)

---

## Key Code Changes

### useEffect - Phase Transitions:

```typescript
useEffect(() => {
  // Navigation: skip all animations
  if (isNavigating) {
    setAnimationPhase("complete");
    return;
  }

  // New guess: sequential phase transitions
  const timers: ReturnType<typeof setTimeout>[] = [];
  let cumulativeTime = 0;

  // hidden → cascade
  cumulativeTime += PHASE_DURATIONS.hidden;
  timers.push(setTimeout(() => setAnimationPhase("cascade"), cumulativeTime));

  // cascade → slideNew
  cumulativeTime += PHASE_DURATIONS.cascade;
  timers.push(setTimeout(() => setAnimationPhase("slideNew"), cumulativeTime));

  // slideNew → colorTransition
  cumulativeTime += PHASE_DURATIONS.slideNew;
  timers.push(
    setTimeout(() => setAnimationPhase("colorTransition"), cumulativeTime)
  );

  // colorTransition → fadeGray
  cumulativeTime += PHASE_DURATIONS.colorTransition;
  timers.push(setTimeout(() => setAnimationPhase("fadeGray"), cumulativeTime));

  // fadeGray → consolidate
  cumulativeTime += PHASE_DURATIONS.fadeGray;
  timers.push(
    setTimeout(() => setAnimationPhase("consolidate"), cumulativeTime)
  );

  // consolidate → updateBoxes
  cumulativeTime += PHASE_DURATIONS.consolidate;
  timers.push(
    setTimeout(() => setAnimationPhase("updateBoxes"), cumulativeTime)
  );

  // updateBoxes → slideCharacter (if winning)
  if (isWinningGuess) {
    timers.push(
      setTimeout(() => setAnimationPhase("slideCharacter"), cumulativeTime)
    );
    cumulativeTime += PHASE_DURATIONS.slideCharacter;
  }

  // Final → complete
  timers.push(setTimeout(() => setAnimationPhase("complete"), cumulativeTime));

  return () => timers.forEach(clearTimeout);
}, [latestGuess.timestamp, isNavigating, isWinningGuess]);
```

### Tag Filtering - Simplified:

```typescript
// OLD (Complex):
const tagsToFadeOut = prevTagStates
  ? Object.entries(tagStates)
      .filter(([tag, currentState]) => {
        const prevState = prevTagStates[tag];
        return (
          prevState &&
          prevState !== "confirmed-non-match" &&
          currentState === "confirmed-non-match"
        );
      })
      .map(([tag]) => tag)
  : [];

const currentTags = Object.entries(tagStates).filter(([tag, state]) => {
  if (tagsToFadeOut.includes(tag) && !isNavigating) return true;
  if (state === "confirmed-non-match" || state === "unguessed") return false;
  // ... more complex logic
});

// NEW (Simple):
const shouldShowTag = (state: TagState) => {
  // Never show unguessed tags
  if (state === "unguessed") return false;

  // Gray tags: only show during fade phase
  if (state === "confirmed-non-match") {
    return animationPhase === "fadeGray";
  }

  // Show confirmed-match and unconfirmed
  return true;
};

const currentTags = Object.entries(tagStates)
  .filter(([tag, state]) => shouldShowTag(state))
  .map(([tag, state]) => ({ tag, state }));
```

### Box Colors - Simplified:

```typescript
// OLD (Complex):
const prevExactMatch = previousGuess?.tagStatesSnapshot ?
  (knowledge[prevExactFlagKey] as boolean) &&
  Object.values(previousGuess.tagStatesSnapshot[...] || {})
    .some(state => state === 'confirmed-match') &&
  // ... more complex checks
  : false;

const displayVisibleTags = (applyBoxColors || isNavigating) ? visibleTags : prevVisibleTags;
const displayIsExact = (applyBoxColors || isNavigating) ? isExactMatch : prevExactMatch;

// NEW (Simple):
const useCurrentState = animationPhase >= 'updateBoxes';
const displayVisibleTags = useCurrentState ? visibleTags : prevVisibleTags;
const displayExactMatch = useCurrentState ? isExactMatch : prevExactMatch;

const bgColor = displayExactMatch
  ? 'bg-green-600'
  : displayVisibleTags > 0
    ? 'bg-yellow-600'
    : 'bg-gray-700';
```

---

## Expected Outcomes

### Bug Fixes:

- ✅ **No flash on navigation** - Bypasses all animation phases
- ✅ **No gray tags on navigation** - Clear phase-based filtering
- ✅ **No box color flashing** - Clean state transitions
- ✅ **No timing confusion** - Sequential phases with constants
- ✅ **No overlapping animations** - Each phase is distinct

### Code Quality:

- ✅ **Easier to understand** - State machine pattern is intuitive
- ✅ **Easier to debug** - Check `animationPhase` to see current state
- ✅ **Easier to modify** - Adjust `PHASE_DURATIONS` or reorder phases
- ✅ **Easier to add features** - Insert new phase in sequence
- ✅ **Better maintainability** - Less cognitive load for future changes

---

## Testing Checklist

After implementation, verify:

- [ ] New guess shows cascade animation smoothly
- [ ] New tags slide in from left
- [ ] Tag colors transition (orange→green, orange→gray)
- [ ] Gray tags fade out
- [ ] Remaining tags consolidate together
- [ ] Category boxes update to green at correct time
- [ ] Winning character slides in (if applicable)
- [ ] Navigation shows guess instantly (no flash, no animations)
- [ ] Knowledge panel always shows current state
- [ ] No gray tags visible when navigating
- [ ] Box colors are stable (no flashing)
- [ ] Multiple rapid guesses don't cause issues
- [ ] Browser back/forward works correctly

---

## Rollback Plan

If refactor causes issues:

1. Git checkout to commit before refactor started
2. Review what went wrong
3. Fix issues in isolated branch
4. Merge when stable

---

## Timeline Estimate

- Phase 1 (Restore & Add): 30-45 minutes
- Phase 2 (Update Rendering): 45-60 minutes
- Phase 3 (Clean Up): 30 minutes
- Testing: 30 minutes

**Total: ~2-3 hours of focused work**

---

## Success Criteria

Refactor is complete when:

1. All existing animations work as before
2. Navigation is instant with no flash
3. No gray tags appear incorrectly
4. Box colors don't flash
5. Code is simpler and easier to understand
6. All tests pass
7. No console errors or warnings

---

_This refactoring will make the animation system maintainable and bug-free. The state machine pattern is industry-standard for managing complex sequential flows._
