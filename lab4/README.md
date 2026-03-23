# Baza dla pliku
docker init\
wybrana opcja Other

# Opis zmian

1. Inny obraz bazowy - zgodnie z treścią zadania
2. Ustawienie wartości LABEL - informacja o autorze
3. Zmiana etapu build - użycie właściwego kontenera do zbudowania projektu strony www
4. Instrukcja RUN - aktualizuje repozytoria pakietów, system i instaluje apache
5. Instrukcja ENV - ustawia zmienne środowiskowe dla konfiguracji apache
6. Dodanie EXPOSE - mówi, że aplikacja będzie wykorzystywała port 80
7. Zmieniona instrukcja COPY - kopiowanie odpowiednich plików we właściwe miejsce
8. Usunięcie instrukcji tworzącej nowego użytkownika - uruchomienie apache2 bez uprawnień roota jest mocno utrudnione
9. Zmiana CMD - uruchomienie właściwego procesu

# Warstwy obrazu
według cli i docker desktop, obraz składa się z łącznie 12 warstw, z czego 3 modyfikują system plików i mają niezerowy rozmiar
```
root@Proxy:/lkata/lab# docker history web100
IMAGE          CREATED          CREATED BY                                      SIZE      COMMENT
f075b46df837   7 seconds ago    CMD ["apachectl" "-D" "FOREGROUND"]             0B        buildkit.dockerfile.v0
<missing>      7 seconds ago    COPY /app/dist/ /var/www/html/ # buildkit       206kB     buildkit.dockerfile.v0
<missing>      46 minutes ago   EXPOSE [80/tcp]                                 0B        buildkit.dockerfile.v0
<missing>      46 minutes ago   ENV APACHE_RUN_DIR=/var/www APACHE_RUN_USER=…   0B        buildkit.dockerfile.v0
<missing>      46 minutes ago   RUN /bin/sh -c apt update     && apt upgrade…   123MB     buildkit.dockerfile.v0
<missing>      46 minutes ago   LABEL org.opencontainers.image.authors=Kata …   0B        buildkit.dockerfile.v0
<missing>      5 weeks ago      /bin/sh -c #(nop)  CMD ["/bin/bash"]            0B        
<missing>      5 weeks ago      /bin/sh -c #(nop) ADD file:1ae27d2ef43693611…   78.1MB    
<missing>      5 weeks ago      /bin/sh -c #(nop)  LABEL org.opencontainers.…   0B        
<missing>      5 weeks ago      /bin/sh -c #(nop)  LABEL org.opencontainers.…   0B        
<missing>      5 weeks ago      /bin/sh -c #(nop)  ARG LAUNCHPAD_BUILD_ARCH     0B        
<missing>      5 weeks ago      /bin/sh -c #(nop)  ARG RELEASE                  0B
```

```
root@Proxy:/lkata/lab# docker image inspect web100 | jq ".[].RootFS"
{
  "Type": "layers",
  "Layers": [
    "sha256:efafae78d70c98626c521c246827389128e7d7ea442db31bc433934647f0c791",
    "sha256:2afde25e98022fb944b941376565897fdff7d63a896f5052783b27f2444fb354",
    "sha256:4aea2cb646b251fd6e48a5f644a7167608dd13c981808e6d1fccf4a4ec690b72"
  ]
}
```

# Komendy
### budowanie obrazu
`docker build -t web100 .`
### uruchomienie kontenera
`docker run -d -p 80:80 --name web web100`\
`docker run -d -p 80:80 --name web registry.lkata.dev/web100`
### sprawdzenie warstw
`docker history web100`\
`docker image inspect web100 | jq ".[].RootFS"`
### zmiana tagu dla repozytorium
`docker tag web100 registry.lkata.dev/web100`
### przesłanie obrazu do repozytorium
`docker push registry.lkata.dev/web100`
