FROM php:8.4-cli-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git unzip libpq-dev libzip-dev libpng-dev libicu-dev libonig-dev libxml2-dev \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql pgsql zip gd intl bcmath pcntl opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Dummy key so artisan can run during the image build. Real APP_KEY comes from Render env.
ENV APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
    APP_ENV=production \
    LOG_CHANNEL=stderr \
    COMPOSER_ALLOW_SUPERUSER=1

ARG CACHET_REF=3.x
RUN git clone --depth 1 --branch "${CACHET_REF}" https://github.com/cachethq/cachet.git . \
    && cp .env.example .env \
    && composer install --no-dev --optimize-autoloader --no-interaction --no-scripts \
    && composer update cachethq/core --no-dev --no-interaction --with-all-dependencies \
    && php artisan package:discover --ansi \
    && php artisan vendor:publish --tag=cachet --force \
    && php artisan vendor:publish --tag=cachet-assets --force || true \
    && php artisan filament:assets --ansi || true \
    && chown -R www-data:www-data /var/www/html

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && chown www-data:www-data /entrypoint.sh

USER www-data
EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
