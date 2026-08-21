FROM ghcr.io/openstatushq/openstatus-dashboard:latest
ENV PORT=10000
ENV HOSTNAME=0.0.0.0
ENV AUTH_TRUST_HOST=true
ENV SELF_HOST=true
