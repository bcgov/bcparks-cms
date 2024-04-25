#FROM image-registry.apps.gold.devops.gov.bc.ca/c1643c-tools/node:18-slim
FROM node:18.20-slim

ENV GATSBY_HOME=/gatsby

WORKDIR $GATSBY_HOME

COPY . $GATSBY_HOME

RUN npm install
