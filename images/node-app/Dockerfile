FROM d.homebots.io/v2/node

ADD entrypoint.sh /home/node/
WORKDIR /home/node/app

ENTRYPOINT ["/bin/bash", "/home/node/entrypoint.sh", "run"]
