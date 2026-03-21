# syntax=docker/dockerfile:1

################################################################################
# Pick a base image to serve as the foundation for the other build stages in
# this file.
FROM ubuntu:latest AS base

LABEL org.opencontainers.image.authors="Kata <s101588@pollub.edu.pl>"

################################################################################
# Create a final stage for running your application.
#
FROM base AS final

# Update ubuntu and download packages
RUN apt update \
    && apt upgrade -y \
    && apt install -y apache2 \
    && rm -rf /var/cache/apt/* \
    && rm -rf /var/lib/apt/lists/*

# Env for apache config
ENV APACHE_RUN_DIR=/var/www \
    APACHE_RUN_USER=www-data \
    APACHE_RUN_GROUP=www-data \
    APACHE_LOG_DIR=/var/log/apache2

# Expose port
EXPOSE 80/tcp

# Copy the executable from the "build" stage.
COPY ./index.html /var/www/html/

# What the container should run when it is started.
CMD [ "apachectl", "-D", "FOREGROUND" ]
