# Baza dla pliku
docker init\
wybrana opcja Other

# Opis zmian

1. Inny obraz bazowy - zgodnie z treścią zadania
2. Ustawienie wartości LABEL - informacja o autorze
3. Usunięcie etapu build - kontener serwuje tylko jeden statyczny plik, nie ma potrzeby dodatkowego budowania
4. Instrukcja RUN - aktualizuje repozytoria pakietów, system i instaluje apache
5. Instrukcja ENV - ustawia zmienne środowiskowe dla konfiguracji apache
6. Dodanie EXPOSE - mówi, że aplikacja będzie wykorzystywała port 80
7. Zmieniona instrukcja COPY - kopiowanie odpowiedniego pliku
8. Usunięcie instrukcji tworzącej nowego użytkownika - uruchomienie apache2 bez uprawnień roota jest mocno utrudnione
9. Zmiana CMD - uruchomienie właściwego procesu

# Warstwy obrazu
według cli i docker desktop, obraz składa się z łącznie 12 warstw

# Komendy
### budowanie obrazu
`docker build -t web100 .`
### uruchomienie kontenera
`docker run -d -p 80:80 --name web web100`\
`docker run -d -p 80:80 --name web registry.lkata.dev/web100`
### sprawdzenie warstw
`docker history web100`
### zmiana tagu dla repozytorium
`docker tag web100 registry.lkata.dev/web100`
### przesłanie obrazu do repozytorium
`docker push registry.lkata.dev/web100`
