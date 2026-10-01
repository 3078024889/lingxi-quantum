FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends libreoffice-writer fonts-noto-cjk fonts-noto-core && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server.mjs ./server.mjs
ENV PORT=8787 HOST=0.0.0.0
EXPOSE 8787
CMD ["node","server.mjs"]
