const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// OpenRouter bloquea IPs de Cuba, pero Render sale por datacenters de EE.UU.,
// así que el destino directo es openrouter.ai (sin pasar por el worker de
// Cloudflare: menos saltos, menos fallos intermitentes y menor latencia).
// El worker (openrouter-proxy.rlarquing.workers.dev) queda como alternativa
// para clientes que SÍ puedan alcanzar workers.dev.
const UPSTREAM = process.env.UPSTREAM || 'https://openrouter.ai';
const PORT = process.env.PORT || 3000;
const app = express();

// Health check para UptimeRobot/cron-job: no pasa por el worker.
app.get('/health', (_req, res) => res.send('ok'));

// Proxy transparente: streaming SSE, headers intactos.
// changeOrigin: true ajusta el Host header al del target automáticamente.
app.use('/', createProxyMiddleware({
  target: UPSTREAM,
  changeOrigin: true,
  // Sin límite de tiempo corto: los modelos pueden tardar minutos en streaming.
  proxyTimeout: 300_000,
  timeout: 300_000,
}));

app.listen(PORT, () => console.log(`proxy -> ${UPSTREAM} :${PORT}`));
