FROM d.homebots.io/v2/node

WORKDIR /home/node/app

ADD entrypoint.sh /home/node/
ADD monitor.js /home/node/
ADD lib/ /home/node/lib

RUN (cd /home/node/lib/node-lambdas && npm link)
ENV RESTART_INTERVAL=5000

ENTRYPOINT ["/bin/bash", "/home/node/entrypoint.sh", "run"]
