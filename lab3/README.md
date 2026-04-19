# Utworzenie katalogów
```
mkdir /registry
cd /registry
mkdir auth cert data html
touch html/index.html
```

# Wygenerowanie pliku z hasłem
```
docker run \
    --rm \
    --entrypoint htpasswd \
    httpd:2 -Bbn user password > auth/htpasswd
```

# Generowanie certyfikatów
// Podziękowania należą się Cloudflare za podpisane i zaufane certyfikaty dla klientów.\
Przy certyfikacie dla kontenera ważne jest wpisanie adresu 127.0.0.1
### Certyfikat dla kontenera:
```
openssl req \
    -newkey rsa:4096 -nodes -sha256 -keyout certs/registry.key \
    -addext "subjectAltName = IP:127.0.0.1" \
    -x509 -days 365 -out certs/registry.crt

    You are about to be asked to enter information that will be incorporated
    into your certificate request.
    What you are about to enter is what is called a Distinguished Name or a DN.
    There are quite a few fields but you can leave some blank
    For some fields there will be a default value,
    If you enter '.', the field will be left blank.
    -----
    Country Name (2 letter code) [AU]:PL
    State or Province Name (full name) [Some-State]:Lubelskie
    Locality Name (eg, city) []:Lublin
    Organization Name (eg, company) [Internet Widgits Pty Ltd]:lkata_dev
    Organizational Unit Name (eg, section) []:
    Common Name (e.g. server FQDN or YOUR name) []:127.0.0.1    
    Email Address []:
```
### Dodanie własnego certyfikatu do zaufanych
Nie ma konieczności dodawania ich dla każdego klienta, jedynie serwer będzie się łączył bezpośrednio z kontenerem.
```
mkdir -p /etc/docker/certs.d/127.0.0.1:5000
cp certs/registry.crt /etc/docker/certs.d/127.0.0.1:5000/ca.crt
mv certs/registry.crt /usr/local/share/ca-certificates/registry.crt
update-ca-certificates
```

# Włączenie kontenera
Adres localhost, ponieważ kontener nie będzie wystawiany publicznie, a dostęp będzie odbywał się przez proxy nginx.\
Dzięki temu możliwe jest wykorzystanie tego samego portu 443 dla kilku aplikacji.\
Wykorzystanie https i logowania też nie jest konieczne, ponieważ trzeba mieć dostęp do serwera by się połączyć pomijając nginx.
```
docker run -d \
    --restart=always \
    --name registry \
    -v /registry/data:/var/lib/registry \
    -p 127.0.0.1:5000:5000 \
    -v /registry/auth:/auth \
    -e "REGISTRY_AUTH=htpasswd" \
    -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
    -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
    -v /registry/certs:/certs \
    -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/registry.crt \
    -e REGISTRY_HTTP_TLS_KEY=/certs/registry.key \
    registry:3
```
# Przekierowanie połączeń z nginx
Jak napisałem wyżej, nginx umożliwia równoległe działanie kilku domen na tym samym serwerze,\
ale też ustawienie strony startowej i bardziej rozbudowanej autoryzacji (tu wykorzystałem tylko podstawową).\
Sama konfiguracja znajduje się w osobnym pliku.

# Test połączenia
### Bez logowania
```
root@Proxy:/lkata/registry# docker pull registry.lkata.dev/web100:latest 
Error response from daemon: Head "https://registry.lkata.dev/v2/web100/manifests/latest": no basic auth credentials
```

### Błędnie hasło
```
root@Proxy:/lkata/registry# docker login registry.lkata.dev
Username: noname
Password: 
Error response from daemon: login attempt to https://registry.lkata.dev/v2/ failed with status: 401 Unauthorized
```

### Dobre hasło
```
root@Proxy:/lkata/registry# docker login registry.lkata.dev
Username: user
Password: 

WARNING! Your credentials are stored unencrypted in '/root/.docker/config.json'.
Configure a credential helper to remove this warning. See
https://docs.docker.com/go/credential-store/

Login Succeeded
```

# Operacje z obrazem
Do sprawdzania polecam użyć właściwego hasła, którego w repo nie ma
### Wysłanie
```
root@Proxy:/lkata/registry# docker push registry.lkata.dev/web100:latest 
The push refers to repository [registry.lkata.dev/web100]
4aea2cb646b2: Pushed 
2afde25e9802: Pushed 
efafae78d70c: Pushed 
latest: digest: sha256:5e8cf08b2a629ac23b78f8fcffab49b38a4527d972faac1a9e9c1522865e5c77 size: 950
```
### Pobranie
```
root@Proxy:/lkata/registry# docker rmi registry.lkata.dev/web100:latest 
Error response from daemon: No such image: registry.lkata.dev/web100:latest
root@Proxy:/lkata/registry# docker pull registry.lkata.dev/web100:latest 
latest: Pulling from web100
505b3596871d: Already exists 
31e5ef248005: Already exists 
d611f02d0913: Already exists 
Digest: sha256:5e8cf08b2a629ac23b78f8fcffab49b38a4527d972faac1a9e9c1522865e5c77
Status: Downloaded newer image for registry.lkata.dev/web100:latest
registry.lkata.dev/web100:latest
```
### Sprawdzenie obrazów w repozytorium
```
root@Proxy:/lkata/registry# curl -u "user:password" https://registry.lkata.dev/v2/_catalog
{"repositories":["web100"]}
root@Proxy:/lkata/registry# curl -u "user:password" https://registry.lkata.dev/v2/web100/tags/list
{"name":"web100","tags":["latest"]}
```
### Usunięcie
```
root@Proxy:/lkata/registry# curl -u "user:password" https://registry.lkata.dev/v2/_catalog
{"repositories":["web100"]}
root@Proxy:/lkata/registry# curl -u "user:password" https://registry.lkata.dev/v2/web100/tags/list
{"name":"web100","tags":["latest"]}
root@Proxy:/lkata/registry# curl -u "user:password" -X DELETE https://registry.lkata.dev/v2/web100/manifests/sha256:5e8cf08b2a629ac23b78f8fcffab49b38a4527d972faac1a9e9c1522865e5c77
root@Proxy:/lkata/registry# curl -u "user:password" https://registry.lkata.dev/v2/_catalog
{"repositories":["web100"]}
root@Proxy:/lkata/registry# curl -u "user:password" https://registry.lkata.dev/v2/web100/tags/list
{"name":"web100","tags":null}
```
Na koniec warto też usunąć niepotrzebne pliki (lub wpisać tą komende do crona)
```
root@Proxy:/lkata/registry# docker exec -it registry bin/registry garbage-collect /etc/distribution/config.yml
DEBU[0000] using "text" logging formatter               
web100

0 blobs marked, 5 blobs and 0 manifests eligible for deletion
...
```
