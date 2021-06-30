FROM node:current-alpine

RUN sed -i -e 's/^root::/root:!:/' /etc/shadow
RUN set -xe && apk add --no-cache bash git openssh nano python3
RUN adduser -S cloudy -G node
RUN chown -R cloudy:node /home/node
ADD conf/.npmrc /home/node

ENV HOME=/home/node
WORKDIR /home/node
USER cloudy
ENV PATH "$PATH:/home/node/npm/bin"
