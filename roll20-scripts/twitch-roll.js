/* global Twitch:true */
/* exported TwitchRollCommand */

var TwitchRollCommand = {
    parseArgs: function(args) {
        var parsed = Twitch.parse({
            "--help": Boolean,
            "--name": String,
            "-n": "--name"
        }, options = {
            argv: args,
            permissive: true
        });

        return parsed;
    },

    run: function(msg, params, args) {
        var dice, character;

        try {
            args = this.parseArgs(args);
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch roll");
            return;
        }
        if (args["--help"] || args["_"].length !== 1) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch roll");
            return;
        }

        character = args["--name"];
        if (!character) {
            character = params["username"];
        }
        var characterid = undefined;
        if (!character) {
            character = "None";
        } else {
            var objects = findObjs({
                _type: "character",
            });
            characterid = _.find(objects, function (obj) {
                return obj.get("name").toLowerCase().startsWith(character.toLowerCase());
            });
        }
        var allowed = TwitchAdminCommand.checkPermission(msg, params["username"], character, "roll");
        if (!allowed) {
            log("DEBUG: permission denied");
            return;
        }

        dice = args["_"][0];
        if (character === "None") {
            character = msg.who;
        } else if (characterid !== undefined) {
            character = "character|" + characterid.id;
        }
        Twitch.write("/roll " + dice, params, {use3d: true}, character);
    },

    usage: function(detailed, lineSeparator = "\n") {
        var message = "!roll20 roll $dice [--name $character]" + lineSeparator;
        if (detailed) {
            message += "    $dice: Dice to roll (eg. d20, 2d10, d6+2)" + lineSeparator;
            message += "    --name | -n: Start of character name to roll for" + lineSeparator;
        }
        return(message);
    }
};
