case $1 in
  build*)
    git clone --depth 1 "$2" /home/node/app
    cd /home/node/app
    (npm ci || npm i || true)
    (npm run build || true)
    npm link node-lambdas
    ;;

  run*)
    cd /home/node/app
    node /home/node/monitor.js
    ;;

esac