case $1 in
  build*)
    git clone --depth 1 "$2" -b "$3" /home/node/app
    cd /home/node/app
    (npm ci --unsafe-perm || npm i --unsafe-perm || true)
    (npm run build || true)
    ;;

  run*)
    cd /home/node/app
    node /home/node/monitor.js
    ;;

esac