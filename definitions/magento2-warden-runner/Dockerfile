# Minimal PHP-Apache container placeholder for Magento
# Replace with your Magento-ready image or extend further
FROM php:8.2-apache

# Install common PHP extensions used by Magento (subset)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    git zip unzip libicu-dev libonig-dev libxml2-dev libzip-dev \
  && docker-php-ext-install \
    intl mbstring opcache pdo pdo_mysql soap xml zip \
  && rm -rf /var/lib/apt/lists/*

# Placeholder index - replace with Magento app or a health endpoint
COPY container-root/index.php /var/www/html/index.php

EXPOSE 80
