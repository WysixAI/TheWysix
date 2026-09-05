import type { Request, Response } from 'express';
import { app } from '../server';

export default function handler(req: Request, res: Response) {
  try {
    // Adjust req.url if rewritten by Vercel
    const originalUrl = (req.headers['x-forwarded-url'] || req.headers['x-matched-path'] || req.url) as string;
    if (originalUrl && originalUrl !== req.url && (originalUrl.startsWith('/api') || originalUrl.startsWith('/auth'))) {
      req.url = originalUrl;
    }
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Błąd funkcji Serverless',
        message: err?.message || String(err),
      });
    }
  }
}
