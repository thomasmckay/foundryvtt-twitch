class _TwitchLeaveCommand {

    constructor() {
        // empty
    }


    parseArgs (args) {
        /* eslint-disable no-undef */
        var parsed = Arg.parse({
            "--help": Boolean,
            "--name": String,
            "-n": "--name"
        }, {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        return parsed;
    }


    async run (msg, params, args) {
        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "!leave");
            return;
        }
        if (args["--help"] || args["_"].length < 1) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "!leave");
            return;
        }

        let characterName = params["username"];
        let character = Twitch.getCharacter(characterName);
        if (!character) {
            console.log("Character not found");
            return;
        }

        if (!Twitch.checkPermission(params["username"], characterName, "leave")) {
            console.log("DEBUG: 'leave' permission denied");
            return;
        }

        let token = Twitch.getCharacterToken(character.name);
        if (!token) {
            console.log("leave: token for name not found: " + name);
            return;
        }

        if (token.actor.data.flags.vtta && token.actor.data.flags.vtta.dndbeyond) {
            let pieces = token.actor.data.flags.vtta.dndbeyond.url.split("/"),
                monsterPiece = pieces[pieces.length - 1],
                monster = monsterPiece.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            await token.update({
                name: monster
            });
            const effect = CONFIG.statusEffects.find(e => e.icon === "icons/svg/frozen.svg");
            await token.toggleEffect(effect, {active: true});
        } else {
            canvas.scene.deleteEmbeddedEntity('Token', token.id)
        }

        Twitch.socket.send(Twitch.sprintf("Goodbye @%s, come !play or !join again soon", character.name));
        Twitch.addToBiography(character, "leave", Twitch.sprintf("%s left", character.name));
    }


    usage (detailed, lineSeparator = "\n") {
        var message = "!leave: Remove character token." + lineSeparator;
        return message;
    }
}
