FROM serversideup/php:8.3-fpm-nginx

# Laravel lives here; nginx serves the /public folder by default.
WORKDIR /var/www/html

# Run Laravel optimizations (config/route/view cache, storage link, migrations)
# automatically each time the container starts.
ENV AUTORUN_ENABLED=true
ENV AUTORUN_LARAVEL_MIGRATION=true

# Install PHP dependencies first for better build caching.
# --no-scripts avoids needing app env vars at build time.
COPY --chown=www-data:www-data composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --optimize-autoloader

# Copy the rest of the application.
COPY --chown=www-data:www-data . .

# Rebuild the optimized autoloader now that app code is present.
RUN composer dump-autoload --no-dev --optimize --no-scripts
