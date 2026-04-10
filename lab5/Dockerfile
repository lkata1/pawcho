# syntax=docker/dockerfile:1.17

FROM oven/bun:1.3.0 AS build
WORKDIR /build
# technicznie tu nie ma zależności potrzebnych do działania, jedynie typy
COPY package.json .
RUN bun install
COPY . .
RUN bun run build

FROM scratch AS final
ARG VERSION="0.0.0"
ADD --unpack=true https://dl-cdn.alpinelinux.org/alpine/v3.23/releases/x86_64/alpine-minirootfs-3.23.3-x86_64.tar.gz /
RUN apk add gcompat libstdc++
COPY --from=build /build/dist /
HEALTHCHECK \
CMD /server test
EXPOSE 80
ENV APP_VERSION=$VERSION
ENTRYPOINT ["/server", "start"]
