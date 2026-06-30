import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { createSocketServer } from './sockets/index.js';

fs.mkdirSync(path.resolve(env.uploadDir), { recursive: true });

const app = createApp();
const server = http.createServer(app);
createSocketServer(server);

server.listen(env.port, () => {
  console.log(`FlatBuddy server running on http://localhost:${env.port}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

