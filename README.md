
docker build -t quay.io/thomasmckay/roll20-twitch:latest .

docker run -it --rm -e "DEBUG=nightmare*,electron*" -v `pwd`/config:/roll20-twitch/config quay.io/thomasmcy/roll20-twitch:latest start

!twitch roll d20

https://docs.tmijs.org

docker build -t roll20-twitch:debug -f Dockerfile.debug . && docker run -it --rm -e "DEBUG=nightmare*,electron*" -v `pwd`/config:/roll20-twitch/config roll20-twitch:debug start

