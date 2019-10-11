
class _TwitchCharacterCommand {

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


    async updateCharacter(token, args) {
        let characterUpdates = {};
        if (args["hp"]) {
            characterUpdates["data.attributes.hp.value"] = parseInt(args["hp"]) || 10;
        }
        if (args["max-hp"]) {
            characterUpdates["data.attributes.hp.max"] = parseInt(args["max-hp"]) || 10;
        }
        if (args["ac"]) {
            characterUpdates["data.attributes.ac.value"] = parseInt(args["ac"]) || 10;
        }
        ["str", "dex", "con", "int", "wis", "cha"].forEach((ability) => {
            if (args[ability]) {
                characterUpdates["data.abilities." + ability + ".value"] = parseInt(args[ability]) || 10;
            }
        });

        if (characterUpdates !== {}) {
            token = await token.actor.update(characterUpdates);
        }

        // BUG: a combat tracker encounter must exist

        /*
        if (!game.combat.getCombatantByToken(token.id)) {
            await game.combat.updateCombatant({tokenId: token.id, hidden: false});
        }
        */
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

        if (!Twitch.checkPermission(params["username"], characterName, "character")) {
            console.log("DEBUG: 'character' permission denied");
            return;
        }

        let token = Twitch.getCharacterToken(characterName);
        if (!token) {
            console.log("!character: character token for name not found: " + name);
            return;
        }
        await this.updateCharacter(token, args);
        character = Twitch.getCharacter(characterName);  // Get updated character

        //if (args["dndbeyond"] && token.data.actorLink && token.actor.data.name === characterName) {
        //    Twitch.setDnDBeyondUrl(character, args["dndbeyond"])
        //}

        Twitch.addToBiography(character, "character", Twitch.sprintf("%s character updated", characterName));
        if (args["dndbeyond"] || args["_"].includes("dndbeyond")) {
            Twitch.socket.send(Twitch.sprintf("@%s %s", characterName,
                                              Twitch.getDnDBeyondUrl(characterName)));
        } else {
            Twitch.socket.send(Twitch.sprintf("@%s max-hp=%s hp=%s ac=%s str=%s dex=%s con=%s int=%s wis=%s cha=%s",
                                              characterName,
                                              token.actor.data.data.attributes.hp.max,
                                              token.actor.data.data.attributes.hp.value,
                                              token.actor.data.data.attributes.ac.value,
                                              token.actor.data.data.abilities.str.value,
                                              token.actor.data.data.abilities.dex.value,
                                              token.actor.data.data.abilities.con.value,
                                              token.actor.data.data.abilities.int.value,
                                              token.actor.data.data.abilities.wis.value,
                                              token.actor.data.data.abilities.cha.value,
                                             ));
        }
    }


    usage(detailed, lineSeparator = "\n") {
        var message = "!character: Update your character";
        if (detailed) {
            message += lineSeparator;
            message += "    hp=10: Set your character's Hit Points" + lineSeparator;
            message += "    ac=10: Set your character's Armor Class" + lineSeparator;
        }
        return (message);
    }
}
