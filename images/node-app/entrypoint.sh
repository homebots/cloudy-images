set -xe

case $1 in
  build*)
    git clone --depth 1 "$2" /home/node/app
    cd /home/node/app
    (npm ci || npm i || true)
    (npm run build || true)
    ;;

  run*)
    cd /home/node/app
    node /home/node/monitor.js npm start
    ;;

esac