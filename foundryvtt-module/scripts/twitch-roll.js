/* exported TwitchRollCommand */
/* global Twitch:true */
/* global TwitchAdminCommand:true */


class _TwitchRollCommand {

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

        // Clean up comment characters
        parsed["_"] = parsed["_"].map(arg => {
            if (arg !== "#") {
                if (arg.startsWith("#")) {
                    arg = ["#", arg.substring(1)];
                }
            }

            return arg;
        }).flat();

        if (parsed["_"][0].startsWith("@")) {
            parsed["--name"] = parsed["_"][0].substring(1);
            parsed["_"] = parsed["_"].slice(1);
        }

        return parsed;
    }


    async roll(character, dice) {
        let roll = new Roll(dice);
        let user = Twitch.getUser(character.name);
        await roll.toMessage({
            user: user.id
        });

        return roll;
    }


    async run (msg, params, args) {
        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch roll");
            return;
        }
        if (args["--help"] || args["_"].length < 1) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch roll");
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
            console.log("roll: token for character not found: " + characterName);
            return;
        }

        if (!Twitch.checkPermission(params["username"], characterName, "roll")) {
            console.log("DEBUG: 'roll' permission denied");
            return;
        }

        var dice = args["_"][0];
        var words = args["_"].slice(1);

        let rolled = await this.roll(character, dice);

        if (words.length > 0) {
            let arg = words[0].toLowerCase();
            if (arg === "initiative" || arg === "init") {
                let combatant = game.combat.data.combatants.find(c => c.token.id === token.id);
                if (combatant) {
                    await game.combat.updateCombatant({_id: combatant.id, initiative: rolled.total});
                }
            }
        }

        var name = params["username"];
        if (characterName !== params["username"]) {
            name = Twitch.sprintf("%s(%s)", name, characterName);
        }
        Twitch.socket.send(Twitch.sprintf("@%s rolled (%s) %s = %s", name, rolled.formula, rolled.result, rolled.total));

        let message;
        if (words.length > 0) {
            message = Twitch.sprintf("%s = %s<br> %s", rolled.formula, rolled.result,
                                     words.join(" "));
        } else {
            message = Twitch.sprintf("%s = %s", rolled.formula, rolled.result);
        }
        Twitch.writeEmote(characterName, message);
    }

    usage (detailed, lineSeparator = "\n") {
        var message = "!roll dice" + lineSeparator;
        if (detailed) {
            message += "    $dice: Dice to roll (eg. d20, 2d10, d6+2)" + lineSeparator;
            message += "    initiative [bonus]: Roll initiative with optional bonus" + lineSeparator;
            message += "    --name | -n: Start of character name to roll for" + lineSeparator;
        }
        return message;
    }
}
