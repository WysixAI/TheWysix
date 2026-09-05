import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../../src/serverApp';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return (app as any)(req, res);
}

export { app, handler };
