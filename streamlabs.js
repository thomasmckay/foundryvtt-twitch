/*

#chat-log .message {
  background: url(../ui/parchment.jpg) repeat;
  border: 2px solid #6f6c66;
  border-radius: 5px;
  margin: 3px;
  padding: 5px;
  color: #191813;
  font-size: 24px;  /* <-- UPDATE */
}

#sidebar {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  position: fixed;
  right: 5px;
  top: 5px;
  width: 500px;  /* <-- UPDATE */
  height: 99vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
*/

const allowedUsers = [];

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
                            allowed = true;
                            console.log("DEBUG: allowing " + message);
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
