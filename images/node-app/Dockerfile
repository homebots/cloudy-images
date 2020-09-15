FROM d.homebots.io/v2/node

ADD entrypoint.sh /home/node/
ADD monitor.js /home/node/
ENV RESTART_INTERVAL=5000
RUN mkdir /home/node/app && chown cloudy:node /home/node/app
RUN npm i -g superstatic

WORKDIR /home/node/app
USER cloudy

ENTRYPOINT ["/bin/bash", "/home/node/entrypoint.sh", "run"]
