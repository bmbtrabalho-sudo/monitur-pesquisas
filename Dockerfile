FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.12.4 --activate

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate
RUN pnpm next build

EXPOSE 3000

CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]
