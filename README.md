# Lightsail

curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
sudo yum install -y nodejs
curl -sL https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo
sudo yum install -y yarn
sudo yum install -y openssl-devel


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

cd ~/programs/fvtt/fvtt-0.6.4
nvm use v14.4.0
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

cd ~/programs/fvtt/fvtt-0.6.4
nvm use v14.4.0
node resources/app/main.js

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


