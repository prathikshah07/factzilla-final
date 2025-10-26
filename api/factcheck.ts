import express from 'express';
import cors from 'cors';
import { performFactCheck } from '../services/geminiService';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

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

app.listen(port, () => {
  console.log(`Factzilla API server listening at http://localhost:${port}`);
});
