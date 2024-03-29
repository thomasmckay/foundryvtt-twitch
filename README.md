A few years back I started to poke around twitch.tv and streaming. I'm not naturally a speaker or extroverted person but the platform itself, and the business and paths to success on it, piqued my curiosity. I have always enjoyed the storytelling that comes along with D&D so I thought it would be fun to have the viewers play via chat with the streamer (me, in this case). To that end, I put together some software that allowed just that! (Pardon the organic and non-production quality code, it grew organically.)

tl;dr There is a twitch bot that connects to twitch's pub/sub and then to a virtual tabletop simulator. This allows twitch chat viewers to enter textual commands (eg. "!roll d20+2") and get the results back in chat directly from the VTT (eg. "you rolled 17 (15+2)"). The VTT is very extensible, which let me be successful with this project.

# Lightsail

curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
sudo yum install -y nodejs
curl -sL https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo
sudo yum install -y yarn
sudo yum install -y openssl-devel

# To allow github
eval "$(ssh-agent)"
ssh-add ~/.ssh/github



https://docs.tmijs.org

docker build -t roll20-twitch:debug -f Dockerfile.debug . && docker run -it --rm -e "DEBUG=nightmare*,electron*" -v `pwd`/config:/roll20-twitch/config roll20-twitch:debug start



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
.chat-message / font-size: 24px;
#chat-form {
  height: 50px;
  flex: 0 0 50px;
  margin: 0 6px 6px;
}


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


