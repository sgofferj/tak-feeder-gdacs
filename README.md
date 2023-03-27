[![Build and publish the container image](https://github.com/sgofferj/tak-feeder-gdacs/actions/workflows/actions.yml/badge.svg)](https://github.com/sgofferj/tak-feeder-gdacs/actions/workflows/actions.yml)

<font color="red">**ALPHA - NOT READY FOR PRODUCTION**</font>
# tak-feeder-gdacs
Feed current GDACS disaster data into your TAK server

(C) 2023 Stefan Gofferje

Licensed under the GNU General Public License V3 or later.

## Description
ToDo

## Purpose
ToDo
## Configuration
The following values are supported and can be provided either as environment variables or through an .env-file.

| Variable | Default | Purpose |
|----------|---------|---------|
| REMOTE_SERVER_URL | empty | (mandatory) TAK server full URL, e.g. ssl://takserver:8089 |
| REMOTE_SSL_SERVER_CERTIFICATE | empty | (mandatory for ssl) User certificate in PEM format |
| REMOTE_SSL_SERVER_KEY | empty | (mandatory for ssl) User certificate key in PEM format |
| GDACS_PULL_INTERVAL | 60 | (optional) Update intervall in seconds |
| LOGCOT | false | (optional) Log created CoTs to the console |
| UUID | empty | (optional) Set feeder UID - if not set, the feeder will create one |

## Certificates
These are the server-issued certificate and key files. Before using, the password needs to be removed from the key file with `openssl rsa -in cert.key -out cert-nopw.key`. OpenSSL will ask for the key password which usually is "atakatak".

## Container use
### Image
The image is built for AMD64 and ARM64 and pushed to ghcr.io: *ghcr.io/sgofferj/tag-feeder-gdacs:latest*
### Docker
First, rename .env.example to .env and edit according to your needs \
Create and start the container:
```
docker run -d --env-file .env -v <path-to-certificate-directory>:/certs:ro --name tak-feeder-gdacs --restart always ghcr.io/sgofferj/ami2mqtt:latest
```

### Docker compose
Here is an example for a docker-compose.yml file:
```
version: '2.0'

services:
  gdacs:
    image: ghcr.io/sgofferj/tak-feeder-gdacs:latest
    restart: always
    networks:
      - default
    volumes:
      - <path to certificate-directory>:/certs:ro
    environment:
      - REMOTE_SERVER_URL=ssl://tak-server:8089
      - REMOTE_SSL_SERVER_CERTIFICATE=cert.pem
      - REMOTE_SSL_SERVER_KEY=key.pem
      - GDACS_PULL_INTERVAL=60
      - LOGCOT=false

networks:
  default:
