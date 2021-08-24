
class _TwitchDnDBeyondCommand {

    constructor() {
        Hooks.on("renderPlayerList", function(app, html, data) {
            let players = html.find(".player");
            for (let player of players) {
                player = $(player);
                let user = game.users.contents.find(u => u.id === player.data("user-id"));
                if (user) {
                    player.find(".player-active").css("background", user.data.color);
                }
            };
        });
    }


    parseArgs(args) {
        var parsed = Arg.parse({
            "--help": Boolean,
            "--name": String,
            "-n": "--name"
        }, {
            argv: args,
            permissive: true
        });

        if (parsed["_"][0].startsWith("@")) {
            parsed["--name"] = parsed["_"][0].substring(1);
            parsed["_"] = parsed["_"].slice(1);
        }

        return parsed;
    }


    async run(msg, params, args) {
        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch character");
            return;
        }
        if (args["--help"]) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch character");
            return;
        }

        let characterName = args["--name"];
        if (!characterName) {
            characterName = params["username"];
        }
        let character = Twitch.getCharacter(characterName);
        if (!character) {
            character = Twitch.getCharacter(params["username"]);
            if (!character) {
                console.log("Character not found");
                return;
            }
        }
        let token = Twitch.getCharacterToken(characterName);
        if (!token) {
            console.log("dndbeyond: token for character not found: " + characterName);
            return;
        }

        if (!Twitch.checkPermission(params["username"], characterName, "dndbeyond")) {
            console.log("DEBUG: 'dndbeyond' permission denied");
            return;
        }

        if (args["_"].length == 1 && (
                args["_"][0].startsWith("https://www.dndbeyond.com/") ||
                args["_"][0].startsWith("https://dndbeyond.com/") ||
                args["_"][0].startsWith("https://ddb.ac/") ||
                args["_"][0].startsWith("dndbeyond.com/") ||
                args["_"][0].startsWith("www.dndbeyond.com/") ||
                args["_"][0].startsWith("ddb.ac/")
        )) {
            if (token.data.actorLink && token.actor.data.name === characterName) {
                await Twitch.setDnDBeyondUrl(token.actor, args["_"][0]);
            }
        }

        var name = params["username"];
        if (characterName !== params["username"]) {
            name = Twitch.sprintf("%s(%s)", name, characterName);
        }
        Twitch.socket.send(Twitch.sprintf("@%s %s", name, Twitch.getDnDBeyondUrl(characterName)));
        return;
    }


    usage(detailed, lineSeparator = "\n") {
        var message = "!dndbeyond: Update your character's DnDBeyond player URL";
        return (message);
    }
}
