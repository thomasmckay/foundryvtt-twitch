/* exported Twitch */

class _Twitch {


    constructor() {
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
        this.TWITCH_COMMANDS["play"] = new _TwitchPlayCommand();
        this.TWITCH_COMMANDS["roll"] = new _TwitchRollCommand();
        this.TWITCH_COMMANDS["rp"] = new _TwitchRPCommand();
        /* eslint-enable no-undef */

        this.scenePan = {};


        // Hooks?
        this.socket = new WebSocket("ws://127.0.0.1:30001");
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
        let token = Twitch.getCharacterToken(tokenName);
        if (!token) {
            return "";
        }
        let biography = token.actor.data.data.details.biography.value;
        if (!biography) {
            return "";
        }
        let url = Twitch.htmlToText(biography).split("\n")[0];
        if (!url.startsWith("https://")) {
            return "No dndbeyond.com linked";
        }
        return url;
    }


    async setDnDBeyondUrl(character, url) {
        if (url.startsWith("www.dndbeyond.com") || url.startsWith("dndbeyond.com") || url.startsWith("ddb.ac")) {
            url = "https://" + url;
        }
        if (!url.startsWith("https://www.dndbeyond.com/") && !url.startsWith("https://dndbeyond.com/") && !url.startsWith("https://ddb.ac/")) {
            return;
        }
        let biography = character.data.data.details.biography.value;
        if (!biography) {
            biography = "";
        }
        let urlLink = this.sprintf("<p><a href=\"%s\">%s</a></p>", url, url);
        await character.update({"data.details.biography.value": urlLink + "<br>" + biography});
    }


    async addToBiography(character, command, message) {
        let entry = this.sprintf("<p>[%s]<br><b>%s :</b> %s</p>", new Date(), command, message);
        await character.update({"data.details.biography.value": character.data.data.details.biography.value + entry})
    }


    async writeEmote(name, message, override) {
        let character = Twitch.getCharacter(name),
            token = Twitch.getCharacterToken(character.name),
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


    _checkPermission(feats, username, character, command) {
        let permissions = Twitch.htmlToText(feats).toLowerCase().split("\n");
        let selfPermission = permissions.find(permission => permission.toLowerCase().startsWith("self:"));
        let allPermission = permissions.find(permission => permission.toLowerCase().startsWith("all:"));
        let charPermission = permissions.find(permission => permission.toLowerCase().startsWith(character.toLowerCase() + ":"));

        if (username === character && selfPermission && selfPermission.indexOf(command.toLowerCase()) != -1) {
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


    checkPermission(username, character, command) {
        let permitted = false;
        if (!character) {
            character = username;
        }

        let twitchCharacter = game.actors.entities.find(actor => { return actor.name === "Twitch"; });
        if (!twitchCharacter) {
            console.log("ERROR: 'Twitch' character not found");
            return false;
        }
        let userPermission = twitchCharacter.items.find(item => item.type === "feat" &&
                                                        item.name.toLowerCase().startsWith(username.toLowerCase()));


        if (userPermission) {
            permitted = this._checkPermission(userPermission.data.data.description.value, username, character, command);
        }
        if (!permitted) {
            let allPermission = twitchCharacter.items.find(item => item.type === "feat" &&
                                                           item.name.toLowerCase().startsWith("All".toLowerCase()));

            if (!allPermission) {
                console.log("ERROR: User permission lookup failed - No 'feat' found");
                return false;
            }
            permitted = this._checkPermission(allPermission.data.data.description.value, username, character, command);
        }

        return permitted
    }

    forceScenePan() {
        if (this.scenePane !== {}) {
            canvas.pan(this.scenePan);
        }
    }

    // static socketListeners(socket) {
    //     game.socket.on("module.foundryvtt-twitch", data => {
    //         console.log("????? data=" + data);
    //         this.scenePane = data;
    //     });
    // }

    saveScenePan() {
        this.scenePan = canvas.scene._viewPosition;
        game.socket.emit("module.foundryvtt-twitch", {
            type:  "scenePan",
            payload: this.scenePan
        });
    }


    sendScenePan() {
        game.socket.emit("module.foundryvtt-twitch", {
            type:  "scenePan",
            payload: this.scenePan
        });
    }

    onReady() {
        game.socket.on("module.foundryvtt-twitch", (data) => {
            console.log("Socket Message received " + data.type);
            if (data.type === "scenePan") {
                Twitch.scenePan = data.payload;
                Twitch.forceScenePan();
            }
        });
    }
}

Twitch = new _Twitch();

Hooks.on("ready", Twitch.onReady);
