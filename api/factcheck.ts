import type { VercelRequest, VercelResponse } from '@vercel/node';

// This file is obsolete and no longer used by the application.
// The app now uses the client-side services/geminiService.ts for all API calls.
// This placeholder handler prevents Vercel build warnings. The file can be safely deleted.
export default function handler(req: VercelRequest, res: VercelResponse) {
    res.status(410).json({ 
        error: 'Gone',
        message: 'This API endpoint is deprecated and no longer in use.' 
    });
}
