import express from 'express';
import cors from 'cors';
import path from 'path';
import { performFactCheck } from '../services/geminiService';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// API route
app.post('/api/factcheck', async (req, res) => {
  const { claim } = req.body;

  if (!claim) {
    return res.status(400).json({ error: 'Claim is required' });
  }

  try {
    const result = await performFactCheck(claim);
    res.json(result);
  } catch (error: any) {
    console.error('Error in fact-check endpoint:', error);
    res.status(500).json({ error: error.message || 'An internal server error occurred' });
  }
});

// Serve static files from the project root
// FIX: Cast process to any to bypass TypeScript error for process.cwd(), which is a valid Node.js function.
app.use(express.static((process as any).cwd()));

// SPA Fallback: for any request that doesn't match an API route or a static file,
// send the index.html file. This is crucial for single-page applications.
app.get('*', (req, res) => {
  // FIX: Cast process to any to bypass TypeScript error for process.cwd(), which is a valid Node.js function.
  res.sendFile(path.join((process as any).cwd(), 'index.html'));
});

app.listen(port, () => {
  console.log(`Factzilla server running at http://localhost:${port}`);
});
