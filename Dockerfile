FROM denoland/deno:2.9.5
USER root
RUN apt-get update && apt-get install -y git ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN git clone --depth 1 https://github.com/openstatusHQ/openstatus.git .
WORKDIR /app/packages/db
CMD ["sh","-c","deno run -A --no-lock --unstable-sloppy-imports src/migrate.mts && sleep infinity"]
