/* global Twitch:true */


Twitch.getCharacter = function(msg, params, args) {
    var characterName = args["--name"];
    if (!characterName) {
        characterName = params["username"];
    }

    var character = undefined;
    if (!characterName) {
        characterName = "None";
    }
    character = game.actors.contents.find(actor => {
        console.log(actor.name);
        return actor.name.toLowerCase().startsWith(characterName.toLowerCase());
    });

    return character;
};


Twitch.registerCommands();

let fvttserver = process.env.FVTTSERVER;
if (!fvttserver) {
    return -1;
}

Twitch.socket = new WebSocket("ws://" +  + ":30001");
Twitch.socket.onopen = function(e) {
    console.log("################ onopen");
};

Twitch.socket.onmessage = function(event) {
    console.log(`################ onmessage: ${event.data}`);
    Twitch.handleChatMessage(event.data);
};

Twitch.socket.onclose = function(event) {
    if (event.wasClean) {
        console.log(`################# onclose: Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
        console.log('################# onclose: Connection died');
    }
};

Twitch.socket.onerror = function(error) {
    console.log(`################## onerror: ${error.message}`);
};


Hooks.on("chatMessage", (app, message, data) => {
    console.log("chatMessage hook: " + message);
    Twitch.handleChatMessage(message);
});
