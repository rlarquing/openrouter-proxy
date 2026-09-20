const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// URL del worker de Cloudflare (se configura como variable de entorno en Render:
// UPSTREAM=https://openrouter-proxy.<tu-subdominio>.workers.dev)
const UPSTREAM = process.env.UPSTREAM || 'https://openrouter-proxy.TODO-CAMBIAR.workers.dev';
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
