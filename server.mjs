import { createServer } from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { tutor } from './tutor.mjs';

const port = Number(process.env.PORT || 3000);
const origin = new URL(process.env.PUBLIC_ORIGIN || process.env.RENDER_EXTERNAL_URL || 'http://localhost:' + port).origin;
const password = process.env.STUDY_SPARK_PASSWORD;
if (!password || password.length < 16) throw new Error('Set STUDY_SPARK_PASSWORD to a random password of at least 16 characters.');
const hash = value => createHash('sha256').update(value).digest();
const expected = hash('Basic ' + Buffer.from('family:' + password).toString('base64'));
const assets = new Map([
  ['/', ['text/html; charset=utf-8', await readFile(new URL('./public/index.html', import.meta.url))]],
  ['/app.js', ['text/javascript; charset=utf-8', await readFile(new URL('./public/app.js', import.meta.url))]]
]);

createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.url === '/health' && req.method === 'GET') return res.writeHead(200).end('OK');
  if (!timingSafeEqual(hash(req.headers.authorization || ''), expected)) {
    return res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Study Spark"' }).end('Sign in to Study Spark.');
  }
  try {
    const url = new URL(req.url, origin);
    const asset = assets.get(url.pathname);
    if (req.method === 'GET' && asset) return res.writeHead(200, { 'Content-Type': asset[0] }).end(asset[1]);
    if (req.method !== 'POST' || url.pathname !== '/tutor') return res.writeHead(404).end('Not found');
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 48000) return res.writeHead(413, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'Please shorten the lesson.' }));
      chunks.push(chunk);
    }
    const request = new Request(url, { method: 'POST', headers: req.headers, body: Buffer.concat(chunks) });
    const response = await tutor(request, origin);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Study Spark could not load this request.' }));
  }
}).listen(port, '0.0.0.0');
