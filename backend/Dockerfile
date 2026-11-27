FROM python:3.11-slim

WORKDIR /app

# Install Node.js 20 and system dependencies required by OpenCV / MediaPipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    libgl1 \
    libglib2.0-0 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python ML dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js dependencies and generate Prisma client
COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate && chmod +x start.sh

ENV NODE_ENV=production
EXPOSE 5000

CMD ["./start.sh"]
