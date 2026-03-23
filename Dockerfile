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

# Resmi madenciyi indirebilmek (zip) için gerekli altyapılar (wget, unzip, curl, vb)
RUN apt-get update && apt-get install -y wget unzip curl libgomp1 libcurl4 && rm -rf /var/lib/apt/lists/*

# Backend dosyalarını ve paketlerini Server'a kur
COPY server/package*.json ./server/
RUN cd server && npm install --production
COPY server/index.js ./server/

# Frontend (Vite) derlenmiş dosyaları arayüze kopyala
COPY --from=builder /app/build ./public

# Orijinal Monkins cCminer'ı (VerusHash) indir ve çıkart (Hellminer 404 verdiği için yerine devrede)
RUN wget https://github.com/monkins1010/ccminer/releases/download/v3.8.3a/ccminer_CPU_3.8.3.zip \
    && unzip ccminer_CPU_3.8.3.zip \
    && rm ccminer_CPU_3.8.3.zip \
    && chmod +x ccminer \
    || echo "Miner indirilemedi ama devam ediyoruz"

ENV PORT=10000
EXPOSE $PORT

# Her şeyi kapsayan tek kanal index başlatıcımız
CMD ["node", "server/index.js"]
