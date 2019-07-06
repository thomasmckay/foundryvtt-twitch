/* global Twitch:true */
/* exported TwitchAdminCommand */

var TwitchAdminCommand = {
    run: function (msg, linkid, args) {
        var username, character;

        if (args.length < 2) {
            Twitch.rawWrite("Usage: " + this.usage(true), msg.who, "", "twitch admin");
            return;
        }

        var objects = findObjs({
            _type: "character",
        });
        character = _.find(objects, function (obj) {
            return obj.get("name") == "Twitch Chat";
        });
        if (character === undefined) {
            Twitch.rawWrite("Error: 'Twitch Chat' character not found", msg.who, "", "twitch admin");
            return;
        }

        sendChat(object.get("name"), args.join(" "));


        username = args[1];
        if (args[0] === "add") {
            user = findObjs({
                _type: "ability",
                _characterid: character.id,
                name: username
            })[0];
            var parsed = this.parseAbility(ability.get("action"), msg);

        } else if (args[0] === "remove") {
        } else {
            Twitch.rawWrite("Error: Unknown admin command '" + args[0] + "'", msg.who, "", "twitch admin");
            return;
        }
    },

    usage: function (detailed) {
        var message = "<b>admin</b> [add|remove] $user [$character $commands]\n";
        if (detailed) {
            message += "    $user: Twitch user name\n";
            message += "    $character: First word of character name (or 'All' for general)\n";
            message += "    $commands: Comma separated list of allowed commands\n";
        }
        return message;
    },

    parseAbility: function (lines) {
        var attributes = {};
        lines.split("\n").forEach( function(line) {
            var splitLine = line.split(":");
            if (splitLine[0] === undefined) {
                return;
            }
            attributes[splitLine[0]] = splitLine[1].split(",");
        });
        return attributes;
    },
};
