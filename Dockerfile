FROM denoland/deno:2.9.5
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates curl \
  && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
RUN git clone --depth 1 https://github.com/openstatusHQ/openstatus.git .
RUN pnpm install --frozen-lockfile --filter=@openstatus/db...
WORKDIR /app/packages/db
RUN touch .env
COPY entrypoint.sh /entrypoint.sh
RUN chmod 755 /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
