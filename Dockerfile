FROM debian:bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive

ENV API_BASE_URL=http://127.0.0.1:11434/api
ENV MODEL_NAME_AT_ENDPOINT=gpt-4o-mini

# Install system dependencies and Node.js
RUN apt-get update && \
    apt-get install -y curl ca-certificates gnupg lsb-release sudo unzip \
    && curl -fsSL https://ollama.com/install.sh | sh \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Override the default entrypoint
ENTRYPOINT ["/bin/sh", "-c"]

# Start Ollama service and pull the model, then run the app
CMD ["ollama serve & sleep 5 && pnpm run dev"]