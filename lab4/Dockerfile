# syntax=docker/dockerfile:1

################################################################################
# Pick a base image to serve as the foundation for the other build stages in
# this file.
FROM ubuntu:latest AS base

# Author label
LABEL org.opencontainers.image.authors="Kata <s101588@pollub.edu.pl>"

# Update ubuntu and download packages
RUN apt update \
    && apt upgrade -y \
    && apt install -y apache2 \
    && rm -rf /var/cache/apt/* \
    && rm -rf /var/lib/apt/lists/*

################################################################################
# Build html files
#
FROM oven/bun:1.3.0 AS build
WORKDIR /app
COPY frontend/package.json .
RUN bun install
COPY frontend .
RUN bun run build

################################################################################
# Create a final stage for running your application.
#
FROM base AS final

# Env for apache config
ENV APACHE_RUN_DIR=/var/www \
    APACHE_RUN_USER=www-data \
    APACHE_RUN_GROUP=www-data \
    APACHE_LOG_DIR=/var/log/apache2

# Expose port
EXPOSE 80/tcp

# Copy the executable from the "build" stage.
COPY --from=build /app/dist/ /var/www/html/

# What the container should run when it is started.
CMD [ "apachectl", "-D", "FOREGROUND" ]
