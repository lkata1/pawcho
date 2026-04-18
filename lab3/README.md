# Utworzenie katalogów
```
mkdir /registry
cd /registry
mkdir auth data html
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
Podziękowania należą się Cloudflare za podpisane i zaufane certyfikaty.

# Włączenie kontenera
Adres localhost przez http, ponieważ kontener nie będzie wystawiany publicznie, a dostęp będzie odbywał się przez proxy nginx.\
Dzięki temu możliwe jest wykorzystanie tego samego portu 443 dla kilku aplikacji.
```
docker run -d \
    --restart=always \
    --name registry \
    -v /registry/data:/var/lib/registry \
    -p 127.0.0.1:5000:5000 \
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

### Po zalogowaniu
```
root@Proxy:/lkata/registry# docker pull registry.lkata.dev/web100:latest 
latest: Pulling from web100
505b3596871d: Already exists 
31e5ef248005: Already exists 
d611f02d0913: Already exists 
Digest: sha256:5e8cf08b2a629ac23b78f8fcffab49b38a4527d972faac1a9e9c1522865e5c77
Status: Downloaded newer image for registry.lkata.dev/web100:latest
registry.lkata.dev/web100:latest
```

### Przeglądanie katalogu curl
Do sprawdzania polecam użyć właściwego hasła, którego w repo nie ma
```
root@Proxy:/lkata/registry# curl -X GET https://registry.lkata.dev/v2/_catalog
<html>
<head><title>401 Authorization Required</title></head>
<body>
<center><h1>401 Authorization Required</h1></center>
<hr><center>nginx/1.22.1</center>
</body>
</html>

root@Proxy:/lkata/registry# curl -X GET -u "noname:passkey" https://registry.lkata.dev/v2/_catalog
<html>
<head><title>401 Authorization Required</title></head>
<body>
<center><h1>401 Authorization Required</h1></center>
<hr><center>nginx/1.22.1</center>
</body>
</html>

root@Proxy:/lkata/registry# # teraz poprawne
root@Proxy:/lkata/registry# curl -X GET -u "user:password" https://registry.lkata.dev/v2/_catalog
{"repositories":["web100"]}
```
