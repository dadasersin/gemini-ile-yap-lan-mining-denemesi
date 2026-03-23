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

# Temel paketler (wget ve curl indirme işlemleri için şart)
RUN apt-get update && apt-get install -y wget tar curl libgomp1 && rm -rf /var/lib/apt/lists/*

# Backend dosyalarını ve paketlerini Server'a kur
COPY server/package*.json ./server/
RUN cd server && npm install --production
COPY server/index.js ./server/

# Frontend (Vite) derlenmiş dosyaları arayüze kopyala
COPY --from=builder /app/build ./public

# Resmi VerusCoin Nheqminer (Linux)
# Not: Doğrudan server klasörüne kopyalıyoruz ki index.js'in dibinde olsun.
RUN wget https://github.com/VerusCoin/nheqminer/releases/download/v0.8.2/nheqminer-Linux-v0.8.2.tgz \
    && tar -xf nheqminer-Linux-v0.8.2.tgz \
    && tar -xf nheqminer-Linux-v0.8.2.tar.gz \
    && mv nheqminer/nheqminer /app/server/miner-bin \
    && chmod +x /app/server/miner-bin \
    && rm -rf nheqminer*

ENV PORT=10000
EXPOSE $PORT

# Her şeyi kapsayan tek kanal index başlatıcımız
CMD ["node", "server/index.js"]
