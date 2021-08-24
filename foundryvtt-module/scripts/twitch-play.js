
class _TwitchPlayCommand {

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
        /* eslint-disable no-undef */
        var parsed = Arg.parse({
            "--help": Boolean,
        }, {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        return parsed;
    }


    async setupPlayer(character, owner, name) {
        let token = Twitch.getCharacterToken(name);
        if (!token) {
            console.log("!play: token does not exist: " + name);
            return false;
        }

        if (!token.data.effects.includes("icons/svg/frozen.svg")) {
            console.log("!play: token does is not 'frozen': " + name);
            return false;
        }
        await token.toggleEffect("icons/svg/frozen.svg");

        await token.update({
            name: character.name,
            disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
            displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
            displayBars: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
            vision: true,
            brightSight: 1,
            dimSight: 10,
        });

        token = Twitch.getCharacterToken(character.name);
        if (!game.combat.getCombatantByToken(token.id)) {
            await game.combat.createCombatant({tokenId: token.id, hidden: false});
        }

        return true;
    }


    async run(msg, params, args) {
        var name, character, objects;

        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch play");
            return;
        }
        if (args["--help"]) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch play");
            return;
        }

        let characterName = params["username"];
        let tokenName = characterName;
        if (args["_"].length > 0 && args["_"][0] !== "") {
            // Don't allow rejoining if token already exists
            if (Twitch.getCharacterToken(characterName)) {
                console.log("!play: token already exists: " + characterName);
                return;
            }
            tokenName = args["_"].join(" ");
        }

        if (!Twitch.checkPermission(params["username"], characterName, "play")) {
            console.log("!play: permission denied: " + characterName);
            return;
        }

        // Create user
        let twitchUser = game.users.contents.find(t => t.name === characterName);
        if (!twitchUser) {
            await User.create({
                name: characterName,
                role: CONST.USER_ROLES.PLAYER,
            });
            twitchUser = game.users.contents.find(t => t.name === characterName);
        }

        character = Twitch.getCharacter(characterName);
        if (!character) {
            character = await CONFIG.Actor.entityClass.create({
                name: characterName,
                type: "character",
                img: "/images/twitch/" + characterName + ".png",
                permission: {
                    default: CONST.ENTITY_PERMISSIONS.OWNER
                },
            }, {
                displaySheet: false
            });
        }
        let success = await this.setupPlayer(character, twitchUser, tokenName);
        if (!success) {
            Twitch.socket.send(Twitch.sprintf("@%s no playable token named %s", character.name, tokenName));
        } else {
            Twitch.addToBiography(character, "play", Twitch.sprintf("%s is playing %s", character.name, tokenName));
            let url = Twitch.getDnDBeyondUrl(character.name);
            Twitch.socket.send(Twitch.sprintf("@%s game on, you're playing %s! %s", character.name, tokenName, url));
        }

        Twitch.sendScenePan();
    }


    usage(detailed, lineSeparator = "\n") {
        var message = "!play: Add or update your character to the game";
        if (detailed) {
            message += lineSeparator;
            message += "    --hp: Set your PC's Hit Points" + lineSeparator;
            message += "    --ac: Set your PC's Armor Class" + lineSeparator;
        }
        return (message);
    }
}
