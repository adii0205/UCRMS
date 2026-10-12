import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes/api';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiRouter);
app.use('/api', (_req, res) => res.status(404).json({ error: '404 Not Found: API endpoint does not exist.' }));

if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(rootDir, 'dist');
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
} else {
  const vite = await createViteServer({
    configFile: path.join(rootDir, 'vite.config.ts'),
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  const status = error && typeof error === 'object' && 'status' in error
    ? Number(error.status)
    : 500;
  const safeStatus = Number.isInteger(status) && status >= 400 && status < 600 ? status : 500;
  const message = safeStatus === 400
    ? '400 Bad Request: Request body is invalid.'
    : '500 Internal Server Error';
  res.status(safeStatus).json({ error: message });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`UCRMS is available at http://localhost:${port}`);
});