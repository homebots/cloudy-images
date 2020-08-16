FROM d.homebots.io/v2/node

WORKDIR /home/node/app

ADD entrypoint.sh /home/node/
ADD monitor.js /home/node/
ADD node-lambdas /home/node/node-lambdas

RUN npm i -g @node-lambdas/core@latest
ENV RESTART_INTERVAL=5000

ENTRYPOINT ["/bin/bash", "/home/node/entrypoint.sh", "run"]
