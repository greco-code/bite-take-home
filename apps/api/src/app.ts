import express, { type Express } from 'express';

import { healthResponseSchema } from '@bite/contracts';

export const app: Express = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_request, response) => {
  response.json(healthResponseSchema.parse({ status: 'ok' }));
});
