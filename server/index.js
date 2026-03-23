const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const net = require('net');
const cors = require('cors');

const app = express();
app.use(cors());

// Basit bir sağlık kontrolü endpoint'i (Render ve Hugging Face için gerekli)
app.get('/health', (req, res) => {
  res.status(200).send('Proxy Server is Running');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

console.log('Stratum WebSocket Proxy başlatılıyor...');

wss.on('connection', (ws, req) => {
  console.log(`[Yeni Bağlantı] İstemci IP: ${req.socket.remoteAddress}`);

  // Tarayıcıdan ilk mesajı bekleyerek hedef havuz bilgisini alacağız.
  // Varsayılan olarak Monero (XMR) havuzuna bağlanmak üzere ayarlı.
  let tcpClient = null;
  let isConnected = false;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // İlk bağlantı kurulumu: { type: 'connect', host: 'pool.hashvault.pro', port: 443 }
      if (data.type === 'connect' && !isConnected) {
        console.log(`[Proxy] Hedef havuza bağlanılıyor: ${data.host}:${data.port}`);
        
        tcpClient = new net.Socket();
        
        tcpClient.connect(data.port, data.host, () => {
          console.log(`[Proxy] Havuz bağlantısı başarılı: ${data.host}:${data.port}`);
          isConnected = true;
          ws.send(JSON.stringify({ type: 'connected', msg: 'Havuz bağlantısı sağlandı.' }));
        });

        tcpClient.on('data', (poolData) => {
          // Havuzdan gelen veriyi tarayıcıya (WebSocket ile) ilet
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pool_data', payload: poolData.toString() }));
          }
        });

        tcpClient.on('end', () => {
          console.log('[Proxy] Havuz bağlantıyı kesti.');
          if (ws.readyState === WebSocket.OPEN) {
             ws.send(JSON.stringify({ type: 'disconnected', msg: 'Havuz bağlantısı koptu.' }));
             ws.close();
          }
        });

        tcpClient.on('error', (err) => {
          console.error(`[Proxy] TCP Hatası: ${err.message}`);
          if (ws.readyState === WebSocket.OPEN) {
             ws.send(JSON.stringify({ type: 'error', msg: `Havuz hatası: ${err.message}` }));
          }
        });
      } 
      // Havuza veri gönderilmesi gerekiyorsa
      else if (data.type === 'mining_data' && isConnected && tcpClient) {
        tcpClient.write(data.payload + '\n');
      }
    } catch (e) {
      console.error('Mesaj işlenirken hata:', e);
    }
  });

  ws.on('close', () => {
    console.log('[İstemci] Bağlantıyı kapattı.');
    if (tcpClient) {
      tcpClient.destroy();
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Proxy Sunucusu çalışıyor: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket port üzerinden dinleniyor...`);
});
