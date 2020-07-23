set -xe

case $1 in
  build*)
    git clone --depth 1 "$2" /home/node/app
    cd /home/node/app
    npm ci
    (npm run build || true)
    ;;

  run*)
    cd /home/node/app
    psy start -n app -- npm start
    psy log -f app
    ;;

esac