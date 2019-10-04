#!/usr/bin/env bash

ENTRY=${ENTRY:=$1}
ENTRY=${ENTRY:=server}

if ! whoami &> /dev/null; then
  if [ -w /etc/passwd ]; then
    echo "${USER_NAME:-default}:x:$(id -u):0:${USER_NAME:-default} user:${HOME}:/sbin/nologin" >> /etc/passwd
  fi
fi

# Required for electron to run
#/usr/bin/dbus-uuidgen > /etc/machine-id

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
    "debug")
        export DEBUG=nightmare:*,electron:*
        export HOME=/roll20-twitch
        exec /usr/bin/scl enable rh-nodejs8 '/usr/bin/xvfb-run --server-args="-ac -screen scrn 1280x2000x24 :99.0" node build/build.js' 2>&1 | /bin/grep -v password
        ;;
    "server")
        export DEBUG=nightmare:actions
        export HOME=/roll20-twitch
        exec /usr/bin/scl enable rh-nodejs8 '/usr/bin/xvfb-run --server-args="-ac -screen scrn 1280x2000x24 :99.0" node build/build.js' 2>&1 | /bin/grep -v password
        ;;
    *)
        exec $ENTRY
        ;;
esac

