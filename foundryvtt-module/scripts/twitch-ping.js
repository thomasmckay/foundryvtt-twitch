class _TwitchPingCommand {

    constructor() {
        // empty
    }


    parseArgs (args) {
        var parsed = Arg.parse({
            "--help": Boolean,
            "--color": String,
            "--text": String
        }, {
            argv: args,
            permissive: true
        });

        for (let i = 0; i < parsed["_"].length; i++) {
            let arg = parsed["_"][i].split("=");
            if (arg.length == 2) {
                parsed["--" + arg[0].toLowerCase()] = arg[1];
            }
        }

        return parsed;
    }


    async run (msg, params, args) {
        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch ping");
            return;
        }
        if (args["--help"]) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch ping");
            return;
        }

        let targetName = params["username"];
        if (args["_"].length != 0 && args["_"][0] !== "" && args["_"][0].indexOf("=") < 0) {
            targetName = args["_"][0];
            if (targetName[0] === "@") {
                targetName = targetName.substring(1);
            }
        }
        let user = Twitch.getUser(targetName);
        let token = Twitch.getCharacterToken(targetName);
        if (!token) {
            console.log("Character token not found");
            return;
        }

        let text = !args["--text"] ? "" : args["--text"];
        let color = !args["--color"] ? "0x58FF33" : "0x" + args["--color"];
        try {
            color = Number(color);
        } catch (error) {
            console.log(`Bad color ${color}`);
            color = 0x58FF33;
        }

        window.Azzu.Pings.performText({
            x: token.x + canvas.grid.w / 2,
            y: token.y + canvas.grid.w / 2
        }, text, color);

        if (!Twitch.checkPermission(params["username"], targetName, "ping")) {
            console.log("DEBUG: 'ping' permission denied");
            return;
        }

        let message = `@${params["username"]} spent platinum pieces: ${text}`;
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ token: token }),
            user: user,
            content: message,
            type: CONST.CHAT_MESSAGE_TYPES.EMOTE
        }, {
            chatBubble: false
        });
    }


    usage (detailed, lineSeparator = "\n") {
        var message = "!ping" + lineSeparator;

        return message;
    }
}
