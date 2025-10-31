# Adding Character Images

## ⚠️ CORS Issue with External APIs

The Star Wars Visual Guide API blocks requests from localhost due to CORS (Cross-Origin Resource Sharing) restrictions. This is a browser security feature that prevents websites from making requests to other domains.

**Current Solution:** Using placeholder SVG images embedded as data URIs in `src/utils/images.ts`

## Current Approach: Embedded SVG Placeholders

We're currently using placeholder SVG images that:

- Work offline
- No CORS issues
- Instant loading
- Show character name
- Star Wars themed

These are temporary placeholders until you add real images.

## Alternative: Local Images (RECOMMENDED)

If you want to use local images instead:

### 1. Create a public/images folder:

```
public/
  images/
    characters/
      luke-skywalker.jpg
      darth-vader.jpg
      ...
```

### 2. Update characters.json:

```json
{
  "id": "luke-skywalker",
  "imageUrl": "/images/characters/luke-skywalker.jpg"
}
```

### 3. Source images from:

- Official Star Wars website (with permission)
- Create your own placeholder silhouettes
- Use AI-generated images
- Commission an artist
- Use public domain/Creative Commons images

## Image Specifications

Recommended:

- Format: JPG or PNG
- Size: 400x400px (square)
- File size: < 100KB each
- Total for 100 characters: ~10MB

## Copyright Considerations

- Star Wars characters are trademarked by Lucasfilm/Disney
- For personal/portfolio projects: Generally okay
- For commercial use: Need licensing
- Fair use may apply for educational/transformative use
- Attribution is always good practice

## Current Implementation

Images are:

- Displayed only on win screen
- Lazy loaded (only when needed)
- Have fallback if image fails to load
- Cached by browser for performance
