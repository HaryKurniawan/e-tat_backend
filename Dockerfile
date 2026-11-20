FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma Client
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate && npm run build

# Ensure upload folders exist
RUN mkdir -p /app/uploads/dokumen /app/uploads/ktp /app/uploads/kta /app/uploads/rekomendasi /app/uploads/bukti /app/uploads/berita_acara

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/src/server.js"]
