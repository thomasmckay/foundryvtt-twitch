/* global Twitch:true */
/* exported TwitchRollCommand */

var TwitchRollCommand = {
    run: function(msg, linkid, args) {
        var dice, character;

        try {
            args = Twitch.parse({
                "--help": Boolean,
                "--name": String,
                "-n": "--name"
            }, options = {
                argv: args,
                permissive: true
            });
        } catch (e) {
            Twitch.rawWrite("INTERNAL ERROR: Argument parsing failed", msg.who, "", "twitch roll");
            return;
        }
        if (args["--help"] || args["_"].length !== 1) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch roll");
            return;
        }

        character = args["--name"];
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
        var allowed = TwitchAdminCommand.checkPermission(msg, TwitchAdminCommand.getTwitchCharacter(msg),
                                                         msg.who, character, "roll");
        if (!allowed) {
            Twitch.rawWrite("Permission Denied", msg.who, "", "twitch roll");
            return;
        }

        dice = args["_"][0];
        if (character === "None") {
            character = msg.who;
        } else if (characterid !== undefined) {
            character = "character|" + characterid.id;
        }
        Twitch.write("/roll " + dice, linkid, {use3d: true}, character);
    },

    usage: function(detailed) {
        var message = "<b>roll</b> roll $dice [--name $character]\n";
        if (detailed) {
            message += "    $dice: Dice to roll (eg. d20, 2d10, d6+2)\n";
            message += "    --name | -n: Start of character name to roll for\n";
        }
        return(message);
    }
};
