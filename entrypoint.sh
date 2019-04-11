#!/usr/bin/env bash

ENTRY=${ENTRY:=$1}
ENTRY=${ENTRY:=server}

if ! whoami &> /dev/null; then
  if [ -w /etc/passwd ]; then
    echo "${USER_NAME:-default}:x:$(id -u):0:${USER_NAME:-default} user:${HOME}:/sbin/nologin" >> /etc/passwd
  fi
fi

display_usage() {
    echo "Usage: ${0} <start|shell|help>"
}

if [[ "${ENTRY}" = "help" ]]
then
    display_usage
    exit 0
fi

case "$ENTRY" in
    "shell")
        exec /usr/bin/scl enable rh-nodejs8 /bin/bash
        ;;
    "start")
        Xvfb -ac -screen scrn 1280x2000x24 :99.0 &
        export DISPLAY=:99.0
        export PATH=/roll20-twitch/node_modules/.bin:$PATH
        exec /usr/bin/scl enable rh-nodejs8 "npm start"
        ;;
    *)
        exec $ENTRY
        ;;
esac

