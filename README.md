
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
node twitch-pubsub.js

See pubsub-step-1.js and pubsub-step-2.js

STREAMLABS


const allowedUsers = ["brokenfocus", "megylu", "blanepatrick", "orsett98"];

const chatCommands = [
    "!rp ",
    "!char",
    "!roll ",
    "!move ",
    "!arrow",
    "!dndbeyond"
];

const chatResponses = [
    " max-hp",
    " rolled",
    " https"
];


const onMutation = (mutationsList) => {
    for (let mutation of mutationsList) {
        if (mutation.addedNodes.length) {
            const addedNodesArray = [...mutation.addedNodes];
            const addedDivs = addedNodesArray.filter((node) => node.nodeName === 'DIV');
            if (addedDivs.length) {
                const chatDiv = addedDivs.pop();
                console.log(chatDiv);

                const name = chatDiv.querySelector('.name').textContent.trim().toLowerCase();
                const message = chatDiv.querySelector('.message').textContent.trim().toLowerCase();
                let allowed = false;

                if (allowedUsers.includes(name)) {
                    if (chatCommands.find(command => message.startsWith(command))) {
                        console.log("DEBUG: allowing " + message);
                        allowed = true;
                    }
                } else if ("playbychat" === name) {
                    allowedUsers.forEach(name => {
                        if (chatResponses.find(response => message.startsWith("@" + name + response))) {
                            console.log("DEBUG: allowing " + message);
                            allowed = true;
                        }
                        if (allowed) {
                            return;
                        }
                    });
                }
                if (!allowed) {
                    console.log("DEBUG: removing " + message);
                    chatDiv.parentNode.removeChild(chatDiv);
                }
            }
        }
    }
};


document.addEventListener('onLoad', function(obj) {
    const chatlog = document.querySelector('#log');
    const config = { childList: true };
    const observer = new MutationObserver(onMutation);
    observer.observe(chatlog, config);
});


document.addEventListener('onEventReceived', function(obj) {
    console.log(obj);
    console.log(allowedUsers);

    if (obj.detail.command === "PRIVMSG") {
        if (obj.detail.body === "!join" && !allowedUsers.includes(obj.detail.from)) {
            console.log("DEBUG: !join " + obj.detail.from);
            allowedUsers.push(obj.detail.from);
        } else if (obj.detail.body === "!leave" && allowedUsers.includes(obj.detail.from)) {
            console.log("DEBUG: !leave " + obj.detail.from);
            let index = allowedUsers.indexOf(obj.detail.from);
            allowedUsers.splice(index, 1);
        }
    }
});


MODULES OF INTEREST:

foundryVTTja--v0.4.2;
encounter-builder--v0.2.1;
resourcesplus--v1.5.1;
about-time--v0.1.45;
adventuremusic--v1.0;
betternpcsheet5e--v0.8.1;
calendar-weather--v2.7.0;
CautiousGamemastersPack--v0.1.4;
chat-autoloader--v1.0.2;
combat-enhancements--v0.1.2;
combat-utility-belt--v1.1.3;
compendium-browser--v0.3.1;
dnd5eja--v0.6.1;
deselection--v1.4.3;
dice-so-nice--v2.0.3;
dice-tooltip--v1.0.4;
dice-calculator--v0.5.10;
dynamiceffects--v0.5.75;
easy-target--v2.2;
fantasy-ui--v0.1.16;
favtab--v0.7.2;
followme--v1.0.0;
fa-dm-screen--v0.4;
forien-quest-log--v0.4.4;
foundry_community_macros--v0.3;
fxmaster--v0.8.1;
Haste--v0.4.9;
maestro--v0.7.1;
mergewalls--v0.0.6;
mess--v0.9.0;
michaelghelfi--v1.0;
mindmap--v0.5.1;
minor-qol--v0.1.35;
mountup--vmr-b1;
tomcartos-ostenwold--v1.0.0;
permission_viewer--v0.7;
pin-cushion--v1.1.2;
pointer--v1.4.7;
popout-resizer--v0.9;
forge-vtt--v1.5;
furnace--v2.0;
theatre--v1.0.11;
tidy-ui_game-settings--v0.1.11;
tidy5e-sheet--v0.2.10;
token-auras--v1.4;
token-health--v0.1.7;
TokenHotbar--v3.3.1;
token-mold--v2.6.1;
tokenmagic--v0.1.0;
turnmarker--v2.6.4;
