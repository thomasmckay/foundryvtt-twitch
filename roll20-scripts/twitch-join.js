/* exported TwitchJoinCommand */
/* global BeyondImporter:true */
/* global setDefaultTokenForCharacter:true */
/* global Twitch:true */
/* global TwitchAdminCommand:true */

var TwitchJoinCommand = {
    parseArgs: function(args) {
        /* eslint-disable no-undef */
        var parsed = Twitch.parse({
            "--help": Boolean,
            "--force": Boolean,
            "--dndbeyond": String,
            "--img": String,
            "--hp": Number,
            "--ac": Number,
            // Hidden
            "--json": String,
        }, options = {
            argv: args,
            permissive: true
        });
        /* eslint-enable no-undef */

        return parsed;
    },

    createToken: function(name) {
        var token = createObj("graphic", {
            _subtype: "token",
            pageid: Campaign().get("playerpageid"),
            layer: "objects",
            imgsrc: "https://s3.amazonaws.com/files.d20.io/images/86578903/SJ7h6YfYuTGBwKxQL2pctg/thumb.png?1563232063",
            top: 35, left: 35,
            width: 70, height: 70,
            name: name,
            showname: true,
            showplayers_name: true,
            showplayers_bar1: true,
            showplayers_bar2: true,
            playersedit_name: true,
            playersedit_bar1: true,
            playersedit_bar2: true
        });

        return token;
    },

    run: function(msg, params, args) {
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

        name = params["username"];
        character = undefined;
        objects = findObjs({
            _type: "character",
        });
        character = _.find(objects, function (obj) {
            return obj.get("name").toLowerCase().startsWith(name.toLowerCase());
        });
        var allowed = TwitchAdminCommand.checkPermission(msg, params["username"], name, "join");
        if (!allowed) {
            log("DEBUG: permission denied");
            return;
        }

        // This is handled in twitch and shouldn't reach here
        if (args["--dndbeyond"]) {
            return;
        }
        if (args["--json"]) {
            try {
                JSON.parse(msg.content.substring(msg.content.indexOf("--json") + 7));
            } catch (e) {
                log("Error parsing character JSON: " +
                    msg.content.substring(msg.content.indexOf("--json") + 7, 100));
                return;
            }
            BeyondImporter.import(msg, msg.content.substring(msg.content.indexOf("--json") + 7));
            return;
        }

        // Create character
        var token;
        if (!character) {
            if (!args["--force"]) {
                Twitch.rawWrite("Character does not exist", msg.who, "", "twitch join");
                return;
            }
            character = createObj("character", {
                name: name,
                inplayerjournals: "all",
                controlledby: "all"
            });
            token = this.createToken(name);
        } else {
            objects = findObjs({
                _pageid: Campaign().get("playerpageid"),
                _type: "graphic",
            });
            token = _.find(objects, function (obj) {
                return obj.get("name").toLowerCase().startsWith(name);
            });
            if (token === undefined) {
                token = this.createToken(name);
            }
        }

        token.set("represents", character.id);

        var attribute = findObjs({
            _type: "attribute",
            _characterid: character.id,
            name: "hp"
        })[0];
        if (token !== undefined && attribute !== undefined) {
            token.set("bar1_link", attribute.get("_id"));
        }
        if (token !== undefined) {
            var hp = args["--hp"];
            if (hp === undefined) {
                hp = 10;
            }
            token.set("bar1_max", hp);
            token.set("bar1_value", hp);
        }
        attribute = findObjs({
            _type: "attribute",
            _characterid: character.id,
            name: "ac"
        })[0];
        if (token !== undefined && attribute !== undefined) {
            //attribute.set("current", attribute.get("max"));
            token.set("bar2_link", attribute.get("_id"));
        }
        if (token !== undefined) {
            var ac = args["--ac"];
            if (ac === undefined) {
                ac = 10;
            }
            token.set("bar2_max", ac);
            token.set("bar2_value", ac);
        }
        setDefaultTokenForCharacter(character, token);

        const style = "margin-left: 0px; overflow: hidden; background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;";
        sendChat("!roll20 join", '<div style="' + style + '">Player <b>' + name +
                 '</b> is ready!</div>', null, {noarchive: true});
    },

    usage: function(detailed, lineSeparator = "\n") {
        var message = "!roll20 join" + lineSeparator;
        /*
        if (detailed) {
            message += "    $dice: Dice to join (eg. d20, 2d10, d6+2)" + lineSeparator;
            message += "    --name | -n: Start of character name to join for" + lineSeparator;
        }
        */
        return (message);
    }
};
