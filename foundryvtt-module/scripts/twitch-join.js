/* exported TwitchJoinCommand */
/* global BeyondImporter:true */
/* global setDefaultTokenForCharacter:true */
/* global Twitch:true */
/* global TwitchAdminCommand:true */

class _TwitchJoinCommand {

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
        /* eslint-disable no-undef */
        var parsed = Arg.parse({
            "--help": Boolean,
        }, {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        for (let i = 0; i < parsed["_"].length; i++) {
            let stat = parsed["_"][i].split("=");
            if (stat.length == 2) {
                parsed[stat[0].toLowerCase()] = stat[1];
            }
        }

        return parsed;
    }


    async setupCharacter(character, args) {
        let characterUpdates = {};
        if (args["hp"]) {
            characterUpdates["data.attributes.hp.max"] = parseInt(args["hp"]) || 10;
            characterUpdates["data.attributes.hp.value"] = parseInt(args["hp"]) || 10;
        }
        if (args["ac"]) {
            characterUpdates["data.attributes.ac.value"] = parseInt(args["ac"]) || 10;
        }
        ["str", "dex", "con", "int", "wis", "cha"].forEach((ability) => {
            if (args[ability]) {
                characterUpdates["data.abilities." + ability + ".value"] = parseInt(args[ability]) || 10;
            }
        });
        if (Object.keys(characterUpdates).length > 0) {
            character = await character.update(characterUpdates);
        }

        // Not useful since current stats are not explicitly embedded, they need to be calculated
        // fs.readFile(config.foundryvtt.images + "/" + character.name + ".json", (err, data) => {
        //     if (!err) {
        //         try {
        //             let dndbeyond = JSON.parse(data);
        //         } catch (e) {
        //             // empty
        //         }
        //     }
        // });

        let token = Twitch.getCharacterToken(character.name);
        if (!token) {
            let startingLocation = this.getStartingLocation();
            const tokenData = {
                name: character.name,
                img: "/images/twitch/" + character.name + ".png",
                x: startingLocation.x,
                y: startingLocation.y,
                disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
                displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
                displayBars: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
                actorId: character.id,
                actorLink: true,
                vision: true,
                brightSight: 1,
                dimSight: 10,
                displayBar1: true,
                bar1: {attribute: "attributes.hp"},
            };
	    // 0.6.6
            // await canvas.tokens.dropActor(character, tokenData);
	    await Token.create(tokenData);
            token = Twitch.getCharacterToken(character.name);
        }

        token = Twitch.getCharacterToken(character.name);
        // BUG: a combat tracker encounter must exist
        if (!game.combat.getCombatantByToken(token.id)) {
            await game.combat.createCombatant({tokenId: token.id, hidden: false});
        }
    }


    moveToStartingLocation(character) {
        let doorCharacter = game.actors.entities.find(actor => { return actor.name === "Door"; });
        if (!doorCharacter) {
            console.log("ERROR: 'Door' character not found");
            return false;
        }
        let doorToken = Twitch.getCharacterToken(doorCharacter.name);
        let token = Twitch.getCharacterToken(character.name);

        token.update({
            x: doorToken.data.x,
            y: doorToken.data.y
        });
    }


    getStartingLocation() {
        let doorCharacter = game.actors.entities.find(actor => { return actor.name === "Door"; });
        if (!doorCharacter) {
            console.log("ERROR: 'Door' character not found");
            return false;
        }
        let doorToken = Twitch.getCharacterToken(doorCharacter.name);

        return({
            x: doorToken.data.x,
            y: doorToken.data.y
        });
    }


    async run(msg, params, args) {
        var name, character, objects;

        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch join");
            return;
        }
        if (args["--help"]) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch join");
            return;
        }

        let characterName = params["username"];

        if (!Twitch.checkPermission(params["username"], characterName, "join")) {
            console.log("DEBUG: 'join' permission denied");
            return;
        }

        // Create user
        let twitchUser = game.users.entities.find(t => t.name === characterName);
        if (!twitchUser) {
            await User.create({
                name: characterName,
                role: CONST.USER_ROLES.PLAYER,
            });
            twitchUser = game.users.entities.find(t => t.name === characterName);
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
        await this.setupCharacter(character, args);
        character = Twitch.getCharacter(characterName);  // Get updated character
        this.moveToStartingLocation(character);

        Twitch.addToBiography(character, "join", Twitch.sprintf("%s joined", character.name));
        Twitch.socket.send(Twitch.sprintf("@%s game on, you're in!", character.name));
        Twitch.sendScenePan();
    }


    usage(detailed, lineSeparator = "\n") {
        var message = "!join: Add or update your character to the game";
        if (detailed) {
            message += lineSeparator;
            message += "    --hp: Set your PC's Hit Points" + lineSeparator;
            message += "    --ac: Set your PC's Armor Class" + lineSeparator;
        }
        return (message);
    }
}
