class _TwitchRPCommand {

    constructor() {
        // empty
    }


    parseArgs (args) {
        var parsed = Arg.parse({
            "--help": Boolean,
            "--name": String,
            "-n": "--name"
        }, {
            argv: args,
            permissive: true
        });

        if (parsed["_"].length !== 0 && parsed["_"][0].startsWith("@")) {
            parsed["--name"] = parsed["_"][0].slice(1);
            parsed["_"] = parsed["_"].slice(1);
        }

        if (parsed["_"][0].startsWith("@")) {
            parsed["--name"] = parsed["_"][0].substring(1);
            parsed["_"] = parsed["_"].slice(1);
        }

        return parsed;
    }


    async run (msg, params, args) {
        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "!rp");
            return;
        }
        if (args["--help"] || args["_"].length < 1) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "!rp");
            return;
        }

        let characterName = args["--name"];
        if (!characterName) {
            characterName = params["username"];
        }
        let character = Twitch.getCharacterToken(characterName);
        if (!character) {
            console.log("Character token not found");
            return;
        }

        if (!Twitch.checkPermission(params["username"], characterName, "rp")) {
            console.log("DEBUG: 'rp' permission denied");
            return;
        }

        if (args["_"].length > 0) {
            let message = args["_"].join(" ");

            Twitch.writeEmote(characterName, message);
        }
    }


    usage (detailed, lineSeparator = "\n") {
        var message = "!rp: Send role play description of actions, etc." + lineSeparator;
        if (detailed) {
            message += "    --name | -n: Start of character name to RP on behalf of" + lineSeparator;
        }
        return message;
    }
}
