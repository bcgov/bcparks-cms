#FROM image-registry.apps.gold.devops.gov.bc.ca/c1643c-tools/caddy:latest
FROM caddy:2.6.2-alpine

ENV APP_ROOT=/usr/share/caddy
ENV XDG_CONFIG_HOME=/tmp/config

ADD Caddyfile /etc/caddy/Caddyfile
ADD Caddyfile.redirects /etc/caddy/Caddyfile.redirects

COPY public/. $APP_ROOT/

# Fix permissions
RUN chgrp -R 0 $APP_ROOT && chmod -R g=u $APP_ROOT

EXPOSE 3000

USER 1001