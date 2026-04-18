# syntax=docker/dockerfile:1.17

FROM oven/bun:1.3.0 AS build
RUN apt update && apt install -y git
RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
RUN --mount=type=ssh git clone --recurse-submodules ssh://git@github.com/lkata1/pawcho6.git
WORKDIR /home/bun/app/pawcho6/source/lab5
RUN bun install
RUN bun run build

FROM scratch AS final
ARG VERSION="0.0.0"
LABEL org.opencontainers.image.source=https://github.com/lkata1/pawcho6
LABEL org.opencontainers.image.description="Simple web server"
LABEL org.opencontainers.image.licenses=MIT
ADD --unpack=true https://dl-cdn.alpinelinux.org/alpine/v3.23/releases/x86_64/alpine-minirootfs-3.23.3-x86_64.tar.gz /
RUN apk add gcompat libstdc++
COPY --from=build /home/bun/app/pawcho6/source/lab5/dist /
HEALTHCHECK \
    CMD /server test
EXPOSE 80
ENV APP_VERSION=$VERSION
ENTRYPOINT ["/server", "start"]
