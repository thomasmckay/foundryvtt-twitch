/* exported Twitch */

class _Twitch {


    constructor(testing) {
        this.testing = testing;
        this.socket = undefined;

        this.TWITCH_COMMAND = "!twitch";

        this.TWITCH_COMMANDS = {};
        /* eslint-disable no-undef */
        this.TWITCH_COMMANDS["arrow"] = new _TwitchArrowCommand();
        this.TWITCH_COMMANDS["character"] = new _TwitchCharacterCommand();
        this.TWITCH_COMMANDS["dndbeyond"] = new _TwitchDnDBeyondCommand();
        this.TWITCH_COMMANDS["join"] = new _TwitchJoinCommand();
        this.TWITCH_COMMANDS["leave"] = new _TwitchLeaveCommand();
        this.TWITCH_COMMANDS["move"] = new _TwitchMoveCommand();
        this.TWITCH_COMMANDS["ping"] = new _TwitchPingCommand();
        this.TWITCH_COMMANDS["redeem"] = new _TwitchRedeemCommand();
        this.TWITCH_COMMANDS["play"] = new _TwitchPlayCommand();
        this.TWITCH_COMMANDS["roll"] = new _TwitchRollCommand();
        this.TWITCH_COMMANDS["rp"] = new _TwitchRPCommand();
        /* eslint-enable no-undef */

        this.scenePan = {};

        Hooks.on("chatMessage", (app, message, data) => {
            console.log("chatMessage hook: " + message);
            //Twitch.handleChatMessage(message);
        });
    }


    setupSocket() {

        this.socket = new WebSocket("ws://" + game.settings.get("foundryvtt-twitch", "server") + ":" + game.settings.get("foundryvtt-twitch", "botport"));

        this.socket.onopen = function(e) {
            console.log("################ onopen");
        };

        this.socket.onmessage = function(event) {
            console.log(`################ onmessage: ${event.data}`);
            Twitch.handleChatMessage(event.data);
        };

        this.socket.onclose = function(event) {
            if (event.wasClean) {
                console.log(`################# onclose: Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                console.log('################# onclose: Connection died');
            }
        };

        this.socket.onerror = function(error) {
            console.log(`################## onerror: ${error.message}`);
        };

        Hooks.on("chatMessage", (app, message, data) => {
            console.log("chatMessage hook: " + message);
            //Twitch.handleChatMessage(message);
        });
    }


    numify(x){
        var xNum = x;
        if (typeof(x) == typeof("")){
            if (x.charAt(0) == "+"){ x = x.substring(1); }
            xNum = parseFloat(x);
        }
        if ("" + xNum == "" + x){ return xNum; }
        return x;
    }


    linkWrite(s, params, style, from) {
        // sendChat(from, s.replace(/\n/g, "<br>"), function (ops) {
        //     sendChat(from, params["linkid"] + ops[0]["content"] + params["linkid"]);
        // }, { noarchive: true });
        console.log("linkWrite: " + s);
    }


    rawWrite(s, who, style, from) {
        //sendChat(from, s.replace(/\n/g, "<br>"), undefined, style);
        console.log("rawWrite: " + s);
    }


    write(s, who, style, from) {
        console.log("write: " + s);
        //return rawWrite(s.replace(/</g, "&lt;").replace(/>/g, "&gt;"), who, style, from);
    }


    // https://gist.github.com/kkragenbrink/5499147
    sprintf(f) {
        var formatRegexp = /%[sdj%]/g;
        var args = Array.prototype.slice.call(arguments, 0);
        var argl = args.length;

        if (typeof f !== "string") {
            var objects = [];
            while (argl--) {
                objects.unshift(args[i].toString());
            }

            return objects.join(" ");
        }

        var i = 1;
        var str = String(f).replace(formatRegexp, function (x) {
            if (x === "%%") {
                return "%";
            }
            if (i >= args) {
                return x;
            }
            switch (x) {
            case "%s" : return String(args[i++]);
            case "%d" : return Number(args[i++]);
            case "%j" : return JSON.stringify(args[i++]);
            default:
                return x;
            }
        });

        var x;
        while (i++ < argl) {
            x = args[i];
            if (x === null || typeof x !== "object") {
                str = [str, x].join(" ");
            } else {
                str += [str, x.toString()].join();
            }
        }

        return str;
    }


    showHelp(who) {
        var helpMsg = "<b>!twitch commands</b>:\n";
        _.each(this.TWITCH_COMMANDS, function (command) {
            helpMsg += command.usage(false);
        });
        this.rawWrite(helpMsg, who, "", "Twitch");
    }


    // TODO: actor.data.flags.vtta.dndbeyond.url
    async macroDnDBeyondActor() {
        let canvasTokens = canvas.tokens.placeables.filter(o => o._controlled);
        for (let i = 0; i < canvasTokens.length; i++) {
            let canvasToken = canvasTokens[i];

            let actor = game.actors.entities.find(actor => {
                return actor.id === canvasToken.actor.id;
            });

            let tokenData = {
                displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
                displayBars: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
                displayBar1: true,
                "bar1.attribute": "attributes.hp",
            };
            await canvasToken.update(tokenData);

            let actorTokenData = {
                "token.displayName": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
                "token.displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
                "token.displayBar1": true,
                "token.bar1.attribute": "attributes.hp",
            };
            await actor.update(actorTokenData);

            let actorData = {
                "permission.default": CONST.ENTITY_PERMISSIONS.OWNER,
            };
            await actor.update(actorData);
        };
    }


    async handleTwitchMessage(tokens, msg) {
        var params = {},
            start = 1;

        if (tokens[1] && tokens[1].charAt(0) === "[") {
            args = tokens[1].substring(1, tokens[1].length-1).split(",");
            start = 2;

            params = {
                linkid: args[0]
            };
            for (let i = 1, len = args.length; i < len; i++) {
                if (args[i].startsWith("username=")) {
                    params["username"] = args[i].substring("username=".length);
                }
            }
        }

        var command = tokens[start];
        var args = tokens.slice(start + 1);

        if (command === undefined) {
            //showHelp(msg.who);
            return;
        }

        if (command === "help") {
            //showHelp(msg.who);
            return;
        } else if (this.TWITCH_COMMANDS[command] === undefined) {
            console.log("Unrecognized command '" + command + "'", msg.who, "", "Twitch");
            //showHelp(msg.who);
            return;
        }

        this.TWITCH_COMMANDS[command].run(msg, params, args);

        return;
    }


    async handleChatMessage(msg) {
        if (msg.indexOf(this.TWITCH_COMMAND) !== 0) {
            return;
        }
        return this.handleTwitchMessage(msg.split(" "), msg);
    }


    getCharacter(characterName) {
        let character = game.actors.entities.find(actor => {
            return actor.name.toLowerCase().startsWith(characterName.toLowerCase());
        });

        return character;
    }


    getUser(name) {
        return game.users.entities.find(u => u.name.toLowerCase() === name.toLowerCase());
    }


    getCharacterToken(characterName) {
        return canvas.tokens.placeables.find(t => t.name.toLowerCase() === characterName.toLowerCase());
    }


    getDnDBeyondUrl(tokenName) {
        let vtta;
        let token = Twitch.getCharacterToken(tokenName);
        if (!token) {
            return "No DnDBeyond character set. See !help dndbeyond";
        }
        if (token.actor.data.flags && token.actor.data.flags.vtta) {
            vtta = token.actor.data.flags.vtta;
        } else if (token.actor.data.data.flags && token.actor.data.data.flags.vtta) {
            vtta = token.actor.data.data.flags.vtta;
        } else {
            return "Use !dndb to set your character's URL";
        }
        return vtta.dndbeyond.url;
    }


    async setDnDBeyondUrl(character, url) {
        if (url.startsWith("www.dndbeyond.com") || url.startsWith("dndbeyond.com") || url.startsWith("ddb.ac")) {
            url = "https://" + url;
        }
        if (!url.startsWith("https://www.dndbeyond.com/") && !url.startsWith("https://dndbeyond.com/") && !url.startsWith("https://ddb.ac/")) {
            return;
        }

        let vtta = character.data.flags.vtta;
        if (!vtta) {
            vtta = {
                dndbeyond: {
                    url: url
                }
            };
            await character.update({"data.flags.vtta": vtta});
        } else {
            await character.update({"data.flags.vtta.dndbeyond.url": url});
        }
    }


    async addToBiography(character, command, message) {
        let entry = this.sprintf("<p>[%s]<br><b>%s :</b> %s</p>", new Date(), command, message);
        await character.update({"data.details.biography.value": character.data.data.details.biography.value + entry})
    }


    async writeEmote(name, message, override) {
        let token = Twitch.getCharacterToken(name),
            user = Twitch.getUser(name);
        let chatMessage = await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ token: token }),
            user: user,
            content: message,
            type: CONST.CHAT_MESSAGE_TYPES.EMOTE
        }, {
            chatBubble: true
        });

        //Twitch.socket.send(Twitch.sprintf(">> @%s: %s", name, Twitch.htmlToText(message)));
    }


    htmlToText(html) {
        return html.replace(/<style([\s\S]*?)<\/style>/gi, '')
                   .replace(/<script([\s\S]*?)<\/script>/gi, '')
                   .replace(/<i>/ig, '')
                   .replace(/<\/i>/ig, '')
                   .replace(/<b>/ig, '')
                   .replace(/<\/b>/ig, '')
                   .replace(/<\/div>/ig, '\n')
                   .replace(/<\/li>/ig, '\n')
                   .replace(/<li>/ig, '  *  ')
                   .replace(/<\/ul>/ig, '\n')
                   .replace(/<\/p>/ig, '\n')
                   .replace(/<br\s*[\/]?>/gi, "\n")
                   .replace(/<[^>]+>/ig, '')
                   .replace(/&nbsp;/ig, '')
    }


    _checkPermission(feats, userName, characterName, command) {
        let permissions = Twitch.htmlToText(feats).toLowerCase().split("\n");
        let selfPermission = permissions.find(permission => permission.toLowerCase().startsWith("self:"));
        let allPermission = permissions.find(permission => permission.toLowerCase().startsWith("all:"));
        let charPermission = permissions.find(permission => permission.toLowerCase().startsWith(characterName.toLowerCase() + ":"));

        if (userName === characterName && selfPermission && selfPermission.indexOf(command.toLowerCase()) != -1) {
            return true;
        }
        if (allPermission && allPermission.indexOf(command.toLowerCase()) != -1) {
            return true;
        }
        if (charPermission && charPermission.indexOf(command.toLowerCase()) != -1) {
            return true;
        }
        return false;
    }


    checkPermission(userName, characterName, command) {
        let permitted = false;
        if (!characterName) {
            characterName = userName;
        }

        let twitchCharacter = game.actors.entities.find(actor => { return actor.name === "Twitch"; });
        if (!twitchCharacter) {
            console.log("ERROR: 'Twitch' character not found");
            return false;
        }
        let userPermission = twitchCharacter.items.find(item => item.type === "feat" &&
                                                        item.name.toLowerCase().startsWith(userName.toLowerCase()));

        if (userPermission) {
            let data = userPermission.data.data;
            if (!data) {
                data = userPermission.data;
            }
            permitted = this._checkPermission(data.description.value, userName, characterName, command);
        }
        if (!permitted && userName === characterName) {
            let allPermission = twitchCharacter.items.find(item => item.type === "feat" &&
                                                           item.name.toLowerCase().startsWith("All".toLowerCase()));

            if (!allPermission) {
                console.log("ERROR: User permission lookup failed - No 'feat' found");
                return false;
            }
            let data = allPermission.data.data;
            if (!data) {
                data = allPermission.data;
            }
            permitted = this._checkPermission(data.description.value, userName, characterName, command);
        }

        return permitted
    }


    forceScenePan() {
        if (this.scenePane !== {}) {
            canvas.pan(this.scenePan);
        }
    }


    // Macro to set scene view and send to other game sessions. In addition, confirm
    // scene is set up.
    //
    async macroSaveScenePan() {
        this.scenePan = canvas.scene._viewPosition;
        game.socket.emit("module.foundryvtt-twitch", {
            type:  "scenePan",
            payload: this.scenePan
        });

        if (game.combats.combats.length < 1) {
            let combat = await game.combats.object.create({scene: canvas.scene._id, active: true});
            await combat.activate();
        }
    }


    sendScenePan() {
        game.socket.emit("module.foundryvtt-twitch", {
            type:  "scenePan",
            payload: this.scenePan
        });
    }


    forceScenePan() {
        if (this.scenePane !== {}) {
            canvas.pan(this.scenePan);
        }
    }


    async onReady() {

	console.log("??????? charname=" + game.user.name);
        if (game.user.name === "Gamemaster") {
            Twitch.setupSocket();
        }

        game.socket.on("module.foundryvtt-twitch", (data) => {
            console.log("Socket Message received " + data.type);
            if (data.type === "scenePan") {
                Twitch.scenePan = data.payload;
                Twitch.forceScenePan();
            }
        });


        // Confirm or create Twitch actor


        // Confirm or create Door actor
    }


    async onInit() {
        await game.settings.register("foundryvtt-twitch", "server", {
            name: "FoundryVTT Server",
            scope: "world",
            config: true,
            type: String,
            default: "127.0.0.1",
            onChange: value => {
                console.log(value)
            }
        });
        await game.settings.register("foundryvtt-twitch", "gameport", {
            name: "FoundryVTT Game Port",
            scope: "world",
            config: true,
            type: String,
            default: "30000",
            onChange: value => {
                console.log(value)
            }
        });
        await game.settings.register("foundryvtt-twitch", "botport", {
            name: "FoundryVTT Twitch Bot Port",
            scope: "world",
            config: true,
            type: String,
            default: "30001",
            onChange: value => {
                console.log(value)
            }
        });
    }
}


let TESTING = false;
if (typeof process !== "undefined" && process) {
    TESTING = process.env.TESTING;
}
console.log("??????? TESTING=" + TESTING);
Twitch = new _Twitch(TESTING);


Hooks.once("init", Twitch.onInit);
Hooks.on("ready", Twitch.onReady);
