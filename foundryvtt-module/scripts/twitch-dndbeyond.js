
class _TwitchDnDBeyondCommand {

    constructor() {
        Hooks.on("renderPlayerList", function(app, html, data) {
            let players = html.find(".player");
            for (let player of players) {
                player = $(player);
                let user = game.users.entities.find(u => u.id === player.data("user-id"));
                if (user) {
                    player.find(".player-active").css("background", user.data.color);
                }
            };
        });
    }


    parseArgs(args) {
        var parsed = Arg.parse({
            "--help": Boolean,
        }, {
            argv: args,
            permissive: true
        });

        return parsed;
    }


    async run(msg, params, args) {
        var name, character, objects;

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

        let characterName = params["username"];

        if (!Twitch.checkPermission(params["username"], characterName, "dndbeyond")) {
            console.log("DEBUG: 'dndbeyond' permission denied");
            return;
        }

        let tokenName = characterName;
        if (args["_"].length == 1 && (
                args["_"][0].startsWith("https://www.dndbeyond.com/") ||
                args["_"][0].startsWith("https://dndbeyond.com/") ||
                args["_"][0].startsWith("https://ddb.ac/") ||
                args["_"][0].startsWith("dndbeyond.com/") ||
                args["_"][0].startsWith("www.dndbeyond.com/") ||
                args["_"][0].startsWith("ddb.ac/")
        )) {
            let token = Twitch.getCharacterToken(characterName);
            if (!token) {
                console.log("!character: character token for name not found: " + name);
                return;
            }

            if (token.data.actorLink && token.actor.data.name === characterName) {
                Twitch.setDnDBeyondUrl(token.actor, args["_"][0]);
                //token = Twitch.getCharacterToken(characterName);
                //Twitch.addToBiography(token.actor, "character", Twitch.sprintf("%s character updated", characterName));
            }
        } else if (args["_"].length == 1 && args["_"][0] !== "") {
            tokenName = args["_"][0];
        }

        Twitch.socket.send(Twitch.sprintf("@%s %s", characterName, Twitch.getDnDBeyondUrl(tokenName)));
        return;
    }


    usage(detailed, lineSeparator = "\n") {
        var message = "!dndbeyond: Update your character's DnDBeyond player URL";
        return (message);
    }
}
