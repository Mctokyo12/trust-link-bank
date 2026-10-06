FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    bash \
    icu-dev \
    oniguruma-dev \
    linux-headers

# Install PHP extensions required for Laravel 12, MySQL, BCMath, and Redis
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath intl opcache
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Set permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 9000
CMD ["php-fpm"]
