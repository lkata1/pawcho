# o obrazie
Dlaczego nie nginx? Środowisko bun umożliwia pisanie aplikacji webowych udostepniających własny serwer http.\
Dodatkowo można z gotowym serwerem zintegrować własne polecenia (na przykład testujące) w jednym pliku wykonywalnym,\
co w tym wypadku wyeliminowało konieczność korzystania z curl.\
Niestety nie daje możliwości zbudowania aplikacji do formy samodzielnego pliku i wymaga zewnętrznych bibliotek.\
\
Uwaga! skrypt budowania jest przystosowany do testowania na komputerach z procesorem x86 i systemów windows/linux,\
w razie potrzeby należy edytować plik build.ts i wpisać właściwy target

# polecenia
- zbudowanie obrazu: ` docker build --build-arg VERSION="3.0.0" -t lab5 . ` 
- utworzenie i włączenie kontenera: ` docker run -dit -p 80:80 --name web lab5 ` 
- sprawdzenie zdrowia: ` docker ps ` 
- odczytanie zawartości strony ` curl http://127.0.0.1/ ` 
- uruchamiające serwer ` ./server start ` 
- sprawdzające healthcheck ` ./server test ` 

### cli
obraz umożliwia też wykorzystanie bardzo prostego cli przez podpięcie się do kontenera
- wyłączenie serwera: `STOP`
- ustawienie by serwer był zdrowy: `health 1`
- ustawienie by test zdrowia zwracał błąd: `health 0`

# wyniki poleceń

## budowanie
```
root@Proxy:/lkata/lab# docker build -t lab5 --build-arg VERSION=3.0.0 .
[+] Building 2.2s (17/17) FINISHED                                                                                                                        docker:default
 => [internal] load build definition from Dockerfile                                                                                                                0.0s
 => => transferring dockerfile: 602B                                                                                                                                0.0s
 => resolve image config for docker-image://docker.io/docker/dockerfile:1.17                                                                                        0.5s
 => CACHED docker-image://docker.io/docker/dockerfile:1.17@sha256:38387523653efa0039f8e1c89bb74a30504e76ee9f565e25c9a09841f9427b05                                  0.0s
 => [internal] load metadata for docker.io/oven/bun:1.3.0                                                                                                           0.5s
 => [internal] load .dockerignore                                                                                                                                   0.0s
 => => transferring context: 117B                                                                                                                                   0.0s
 => [build 1/6] FROM docker.io/oven/bun:1.3.0@sha256:00cccad6e9c66bbacc250851f689168606aaea551ac473e908bbcf00a5645025                                               0.0s
 => [internal] load build context                                                                                                                                   0.0s
 => => transferring context: 310B                                                                                                                                   0.0s
 => CACHED [final 1/3] ADD --unpack=true https://dl-cdn.alpinelinux.org/alpine/v3.23/releases/x86_64/alpine-minirootfs-3.23.3-x86_64.tar.gz /                       0.0s
 => CACHED [final 1/3] ADD --unpack=true https://dl-cdn.alpinelinux.org/alpine/v3.23/releases/x86_64/alpine-minirootfs-3.23.3-x86_64.tar.gz /                       0.0s
 => [final 2/3] RUN apk add gcompat libstdc++                                                                                                                       0.5s
 => CACHED [build 2/6] WORKDIR /build                                                                                                                               0.0s
 => CACHED [build 3/6] COPY package.json .                                                                                                                          0.0s
 => CACHED [build 4/6] RUN bun install                                                                                                                              0.0s
 => CACHED [build 5/6] COPY . .                                                                                                                                     0.0s
 => CACHED [build 6/6] RUN bun run build                                                                                                                            0.0s
 => [final 3/3] COPY --from=build /build/dist /                                                                                                                     0.2s
 => exporting to image                                                                                                                                              0.2s
 => => exporting layers                                                                                                                                             0.1s
 => => writing image sha256:eaeef8c33a26c51eb15246b86e8f2c6b9389551eedef4bb7a40bd4d40775f70e                                                                        0.0s
 => => naming to docker.io/library/lab5                                                                                                                             0.0s
```

## stan zdrowia
można też zauwazyć, że id kontenera pokrywa się z nazwą hosta na stronie
```
root@Proxy:~# docker ps | grep web
04aba36f0664   lab5            "/server start"          36 seconds ago   Up 36 seconds (healthy)   80/tcp              web
```
po wpisaniu `health 0` w cli i odczekaniu chwili:
```
root@Proxy:~# docker ps | grep web
04aba36f0664   lab5             "/server start"          2 minutes ago   Up 2 minutes (unhealthy)   80/tcp              web
```

## curl
```
root@Proxy:~# curl http://127.0.0.1
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <p>Serwer nasłuchuje na IP: [IPv6] ::</p>
    <div>
        <p>Adresy kart sieciowych serwera</p>
        <ul>
            <li><p>[lo]</p><ul><li>[IPv4] 127.0.0.1</li><li>[IPv6] ::1</li></ul></li><li><p>[eth0]</p><ul><li>[IPv4] 172.17.0.8</li></ul></li>
        </ul>
    </div>
    <p>Nazwa hosta: 04aba36f0664</p>
    <p>Wersja aplikacji: 3.0.0</p>
</body>
</html>
```
![screen z przeglądarki](images/lab5_browser.png)
