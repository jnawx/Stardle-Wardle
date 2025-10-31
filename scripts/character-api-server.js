import express from 'express';
import cors from 'cors';
import { populateCharacterInfo } from './populate-character-api.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/**
 * POST /api/populate-character
 * Body: { characterId, characterName, populateAll, currentData }
 */
app.post('/api/populate-character', async (req, res) => {
  const { characterId, characterName, populateAll = false, currentData = {} } = req.body;
  
  if (!characterId || !characterName) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: characterId and characterName'
    });
  }
  
  try {
    const result = await populateCharacterInfo(characterId, characterName, populateAll, currentData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Character Population API Server`);
  console.log(`   Running on: http://localhost:${PORT}`);
  console.log(`   Endpoint: POST /api/populate-character`);
  console.log(`\n✅ Server is ready!\n`);
});
