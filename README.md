
docker build -t quay.io/thomasmckay/roll20-twitch:latest .

docker run -it --rm -e "DEBUG=nightmare*,electron*" -v `pwd`/config:/roll20-twitch/config quay.io/thomasmcy/roll20-twitch:latest start

!twitch roll d20

https://docs.tmijs.org

docker build -t roll20-twitch:debug -f Dockerfile.debug . && docker run -it --rm -e "DEBUG=nightmare*,electron*" -v `pwd`/config:/roll20-twitch/config roll20-twitch:debug start

## Roll20 Script

The game script must be named 'build.js'

make GAME=$game SCRIPT=$script


node build/build.js

cd roll20-scripts
yarn eslint twitch*.js



const getTurnArray = () => ( '' === Campaign().get('turnorder') ? [] : JSON.parse(Campaign().get('turnorder')));
const setTurnArray = (ta) => Campaign().set({turnorder: JSON.stringify(ta)});
const addTokenTurn = (id, pr) => Campaign().set({ turnorder: JSON.stringify( [...getTurnArray(), {id,pr}]) });
const addCustomTurn = (custom, pr) => Campaign().set({ turnorder: JSON.stringify( [...getTurnArray(), {id:-1,custom,pr}]) });
const removeTokenTurn = (tid) => Campaign().set({ turnorder: JSON.stringify( getTurnArray().filter( (to) => to.id !== tid)) });
const clearTurnOrder = () => Campaign().set({turnorder:'[]'});
const sorter_asc = (a, b) => b.pr - a.pr;
const sorter_desc = (a, b) => a.pr - b.pr;
const sortTurnOrder = (sortBy = sorter_desc) => Campaign().set({turnorder: JSON.stringify(getTurnArray().sort(sortBy))});

FoundryVTT

cd twitch-bot
make build && node build/foundryvtt-build.js

cd foundryvtt-module
make install

cd ~/programs/fvtt/fvtt-0.6.0
nvm use v13.11.0
node resources/app/main.js

CSS

/home/thomasmckay/programs/fvtt/fvtt-0.6.0/resources/app/public/css/style.css

#sidebar / width: 500px;
#chat-log .message / font-size: 24px;


NOTES

actor = game.actors.entities.find(actor => { return actor.name === "PintAndPie"; });
token = canvas.tokens.placeables.find(t => t.name.toLowerCase() === "PintAndPie".toLowerCase());
actor.rollAbility("str")  <-- raises dialog

TOKENS

https://www.syncrpg.com/token/

NODE

nvm use v14.4.0
npm install twitch@next twitch-pubsub-client@next twitch-chat-client@next
