import path from 'path';
import express from 'express';
import { app } from './src/serverApp';

const PORT = 3000;

async function startServer() {
  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KitekBot Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export { app };
export default app;
