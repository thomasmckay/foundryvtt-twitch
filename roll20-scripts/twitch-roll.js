/* exported TwitchRollCommand */
/* global Twitch:true */
/* global TwitchAdminCommand:true */

var TwitchRollCommand = {
    parseArgs: function(args) {
        /* eslint-disable no-undef */
        var parsed = Twitch.parse({
            "--help": Boolean,
            "--name": String,
            "-n": "--name"
        }, options = {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        return parsed;
    },

    run: function(msg, params, args) {
        var characterName, character;

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

        characterName = args["--name"];
        if (!characterName) {
            characterName = params["username"];
        }
        var characterid = undefined;
        if (!characterName) {
            characterName = "None";
        } else {
            var objects = findObjs({
                _type: "character",
            });
            characterid = _.find(objects, function (obj) {
                return obj.get("name").toLowerCase().startsWith(characterName.toLowerCase());
            });
        }
        var allowed = TwitchAdminCommand.checkPermission(msg, params["username"], characterName, "roll");
        if (!allowed) {
            log("DEBUG: permission denied");
            return;
        }

        if (characterName === "None" || character === undefined) {
            character = msg.who;
        } else if (characterid !== undefined) {
            character = "character|" + characterid.id;
        }

        var dice = args["_"][0];
        if (args["_"].length > 1) {
            var command = args["_"][1].toLowerCase();
            if (command === "initiative" || command === "init") {
                /* eslint-disable func-style */
                const getTurnArray = () => ( Campaign().get('turnorder') === '' ? [] : JSON.parse(Campaign().get('turnorder')));
                const addTokenTurn = (id, pr) => Campaign().set({ turnorder: JSON.stringify( [...getTurnArray(), {id, pr}]) });
                /* eslint-enable func-style */

                objects = findObjs({
                    _pageid: Campaign().get("playerpageid"),
                    _type: "graphic",
                });
                var token = _.find(objects, function (obj) {
                    return obj.get("name").toLowerCase().startsWith(characterName.toLowerCase());
                });
                if (token !== undefined) {
                    sendChat(character, "/roll " + dice, function (ops) {
                        var result = JSON.parse(ops[0]["content"]).total,
                            description = args["_"].slice(2).join(" ");
                        addTokenTurn(token.id, result);
                        sendChat(character, Twitch.sprintf("<b>INITIATIVE %s</b> %s", result, description));
                    }, {use3d: true})
                }
            } else {
                Twitch.write("/roll " + args["_"].join(" "), params, {use3d: true}, character);
            }
        } else {
            Twitch.write("/roll " + dice, params, {use3d: true}, character);
        }
    },

    usage: function(detailed, lineSeparator = "\n") {
        var message = "!roll20 roll $dice [--name $character]" + lineSeparator;
        if (detailed) {
            message += "    $dice: Dice to roll (eg. d20, 2d10, d6+2)" + lineSeparator;
            message += "    initiative [bonus]: Roll initiative with optional bonus" + lineSeparator;
            message += "    --name | -n: Start of character name to roll for" + lineSeparator;
        }
        return message;
    }
};
